import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * AskQuickSuggestions.tsx
 * Default export (so import AskQuickSuggestions from "../components/AskQuickSuggestions"; works)
 */

type Suggestion = {
  id: string;
  text: string;
  created_at?: string;
};

export default function AskQuickSuggestions({
  query,
  onSelect,
  minChars = 3,
  limit = 6,
}: {
  query: string;
  onSelect: (item: Suggestion) => void;
  minChars?: number;
  limit?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // debounce
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    let aborted = false;
    async function run() {
      setError(null);
      if (!debouncedQuery || debouncedQuery.trim().length < minChars) {
        setItems([]);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("queries")
          .select("id, text, created_at")
          .ilike("text", `%${debouncedQuery}%`)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;
        if (aborted) return;

        setItems(
          (data || []).map((r: any) => ({
            id: r.id,
            text: r.text ?? r.title ?? "(no text)",
            created_at: r.created_at,
          }))
        );
      } catch (err: any) {
        console.error("AskQuick Suggestions error:", err);
        setError(err?.message || "Failed to load suggestions");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [debouncedQuery, minChars, limit]);

  return (
    <div className="w-full">
      <div className="bg-white border rounded-md shadow-sm">
        {loading ? (
          <div className="p-3 text-sm text-muted-foreground">Searching similar questions…</div>
        ) : error ? (
          <div className="p-3 text-sm text-red-600">Error: {error}</div>
        ) : items.length === 0 ? (
          debouncedQuery && debouncedQuery.length >= minChars ? (
            <div className="p-3 text-sm text-slate-500">No similar questions found.</div>
          ) : null
        ) : (
          <ul className="divide-y">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => onSelect(it)}
                  className="w-full text-left p-3 hover:bg-slate-50"
                >
                  <div className="font-medium">{it.text}</div>
                  {it.created_at && (
                    <div className="text-xs text-slate-400">Asked {new Date(it.created_at).toLocaleString()}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- helper: small debounce hook ---------- */
function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
