import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Resource = {
  id: string;
  title?: string;
  subject?: string;
  branch?: string;
  semester?: number;
  type?: string;
  verified?: boolean;
  uploaded_at?: string;
  created_at?: string;
};

export default function ResourcesSearch({
  initialQuery = "",
  limit = 12,
  onResults,
}: {
  initialQuery?: string;
  limit?: number;
  onResults?: (items: Resource[]) => void;
}) {
  const [q, setQ] = useState(initialQuery);
  const debouncedQ = useDebounce(q, 300);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exact, setExact] = useState<Resource[]>([]);
  const [similar, setSimilar] = useState<Resource[]>([]);

  useEffect(() => {
    let aborted = false;
    async function run() {
      setError(null);
      if (!debouncedQ || debouncedQ.trim().length === 0) {
        setExact([]);
        setSimilar([]);
        if (onResults) onResults([]);
        return;
      }

      setLoading(true);
      try {
        const qText = debouncedQ.trim();

        // -------------------------
        // 1) Exact matches (title OR subject)
        // -------------------------
        const { data: exactData, error: exactErr } = await supabase
          .from("resources")
          .select("id, title, subject, branch, semester, type, verified, uploaded_at")
          .ilike("title", `%${qText}%`)
          .or(`subject.ilike.%${qText}%`)
          .order("uploaded_at", { ascending: false })
          .limit(limit);

        if (exactErr) throw exactErr;
        if (aborted) return;

        // normalize: map uploaded_at -> created_at for backward compatibility
        const exactRows: Resource[] = (exactData || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          subject: r.subject,
          branch: r.branch,
          semester: r.semester,
          type: r.type,
          verified: r.verified,
          uploaded_at: r.uploaded_at,
          created_at: r.created_at ?? r.uploaded_at,
        }));
        setExact(exactRows);

        // -------------------------
        // 2) Similar matches (tokenized)
        // -------------------------
        const tokens = qText
          .split(/\s+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 5);

        let simRows: Resource[] = [];
        if (tokens.length > 0) {
          const orParts: string[] = [];
          tokens.forEach((tok) => {
            const safe = tok.replace(/%/g, "\\%");
            orParts.push(`title.ilike.%${safe}%`);
            orParts.push(`subject.ilike.%${safe}%`);
          });
          const orExpr = orParts.join(",");

          const { data: simData, error: simErr } = await supabase
            .from("resources")
            .select("id, title, subject, branch, semester, type, verified, uploaded_at")
            .or(orExpr)
            .order("uploaded_at", { ascending: false })
            .limit(limit * 2);

          if (simErr) throw simErr;
          if (aborted) return;

          simRows = (simData || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            subject: r.subject,
            branch: r.branch,
            semester: r.semester,
            type: r.type,
            verified: r.verified,
            uploaded_at: r.uploaded_at,
            created_at: r.created_at ?? r.uploaded_at,
          }));
        }

        // dedupe similar rows that are in exactRows
        const exactIds = new Set(exactRows.map((x) => x.id));
        const filteredSim = simRows.filter((s) => !exactIds.has(s.id));

        setSimilar(filteredSim);

        const merged = [...exactRows, ...filteredSim].slice(0, limit);
        if (onResults) onResults(merged);
      } catch (err: any) {
        console.error("ResourcesSearch error", err);
        setError(err?.message || "Search failed");
        setExact([]);
        setSimilar([]);
        if (onResults) onResults([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [debouncedQ, limit, onResults]);

  const combined = useMemo(() => [...exact, ...similar].slice(0, limit), [exact, similar, limit]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search resources — title or subject"
          className="w-full px-3 py-2 border rounded-md"
        />
        <button
          className="px-3 py-2 border rounded-md"
          onClick={() => {
            setQ("");
            setExact([]);
            setSimilar([]);
            setError(null);
            if (onResults) onResults([]);
          }}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-600">Searching…</div>
      ) : error ? (
        <div className="text-sm text-red-600">Error: {error}</div>
      ) : combined.length === 0 && q.trim() ? (
        <div className="text-sm text-slate-600">No results</div>
      ) : (
        <div className="space-y-1">
          {exact.length > 0 && (
            <>
              <div className="text-xs font-semibold text-slate-600">Exact matches</div>
              {exact.map((r) => (
                <div key={r.id} className="p-2 border rounded hover:bg-slate-50">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.subject}</div>
                </div>
              ))}
            </>
          )}

          {similar.length > 0 && (
            <>
              <div className="text-xs font-semibold text-slate-600">Similar suggestions</div>
              {similar.map((r) => (
                <div key={r.id} className="p-2 border rounded hover:bg-slate-50">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.subject}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* debounce hook */
function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
