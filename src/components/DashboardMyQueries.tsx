import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ReplyItem = {
  id: string;
  query_id: string;
  body: string;
  author_id?: string;
  created_at?: string;
};

type QueryItem = {
  id: string;
  title: string;
  body?: string;
  answered: boolean;
  createdAt: string;
  ownerId?: string; // author/owner id from DB
  replies?: ReplyItem[]; // attached replies
};

export default function DashboardMyQueries({ pageSize = 10 }: { pageSize?: number }) {
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "answered" | "unanswered">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let aborted = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // get current user id once
        const { data: userResp, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        const userId = userResp?.user?.id ?? null;
        setCurrentUserId(userId);
        if (!userId) {
          setQueries([]);
          setError("No user logged in");
          return;
        }

        // fetch queries that belong to current user (server-side)
        const qRes = await supabase
          .from("queries")
          .select("id, text, description, status, answered, created_at, author_id")
          .eq("author_id", userId)
          .order("created_at", { ascending: false });

        if (qRes.error) {
          // fallback: fetch all and filter client-side
          const fallback = await supabase.from("queries").select("*").order("created_at", { ascending: false });
          if (fallback.error) throw fallback.error;
          const all = fallback.data || [];
          // detect user field
          const firstRow = all[0] || {};
          const userField = ["author_id", "user_id", "owner", "created_by"].find((k) => k in firstRow) ?? null;
          if (!userField) {
            setError("No user-id-like column found in `queries` table.");
            setQueries([]);
            return;
          }
          const myRows = all.filter((r: any) => String(r[userField]) === String(userId));
          // map minimal queries
          const mapped = myRows.map((r: any) => ({
            id: r.id ?? r.query_id ?? String(Math.random()).slice(2),
            title: String(r.text ?? r.title ?? r.question ?? "(No title)"),
            body: String(r.description ?? r.detail ?? r.body ?? ""),
            answered: r.hasOwnProperty("answered")
              ? !!r.answered
              : (typeof r.status === "string" ? r.status.toUpperCase() !== "OPEN" : false),
            createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
            ownerId: r[userField],
            replies: [],
          })) as QueryItem[];
          setQueries(mapped);
          // continue to fetch replies for mapped ids below
        } else {
          const data = qRes.data || [];
          const mapped = (data as any[]).map((q) => ({
            id: q.id,
            title: String(q.text ?? q.title ?? q.question ?? "(No title)"),
            body: String(q.description ?? q.detail ?? q.body ?? ""),
            answered: q.hasOwnProperty("answered")
              ? !!q.answered
              : (typeof q.status === "string" ? q.status.toUpperCase() !== "OPEN" : false),
            createdAt: q.created_at ?? new Date().toISOString(),
            ownerId: q.author_id ?? q.user_id ?? null,
            replies: [],
          })) as QueryItem[];
          setQueries(mapped);
        }

        // If there are queries, fetch replies for them in one go
        // Get current queries IDs from state (just set above)
        const ids = (aborted ? [] : (await (async () => {
          // wait one tick so setQueries is applied, or just derive from qRes/data above
          // we'll re-read state queries if available
          return (qRes?.data ?? (await supabase.from("queries").select("*").limit(0)).data) ? undefined : undefined;
        })())) as undefined;

        // Instead of the above complex read, just build id list from what we have in `queries` variable
        const currentIds = (queries.length ? queries.map((q) => q.id) : undefined)
          ?? (qRes && (qRes.data || []).map((d: any) => d.id)) ?? [];

        if (currentIds.length === 0) {
          // nothing to fetch
          return;
        }

        // fetch replies for these query ids
        const rRes = await supabase
          .from("replies")
          .select("id, query_id, body, text, author_id, created_at")
          .in("query_id", currentIds)
          .order("created_at", { ascending: true });

        if (rRes.error) {
          // if replies table name or columns differ, try generic select * and filter client side
          const fallbackReplies = await supabase.from("replies").select("*");
          if (!fallbackReplies.error) {
            const allReplies: any[] = fallbackReplies.data || [];
            const myReplies = allReplies.filter((r) => currentIds.includes(String(r.query_id ?? r.queryId ?? r.post_id ?? r.parent_id)));
            attachRepliesToQueries(myReplies);
          } else {
            // no replies table or other error — ignore replies
            console.warn("No replies data or replies table not found:", rRes.error);
          }
        } else {
          const replyRows: any[] = rRes.data || [];
          // normalize reply body key (body or text)
          const normalized = replyRows.map((r) => ({
            id: r.id ?? String(Math.random()).slice(2),
            query_id: r.query_id ?? r.queryId ?? r.post_id ?? r.parent_id,
            body: String(r.body ?? r.text ?? r.answer ?? ""),
            author_id: r.author_id ?? r.user_id ?? r.created_by ?? null,
            created_at: r.created_at ?? r.inserted_at ?? null,
          })) as ReplyItem[];
          attachRepliesToQueries(normalized);
        }
      } catch (err: any) {
        console.error("DashboardMyQueries load error:", err);
        setError(err?.message || "Failed to load queries");
      } finally {
        if (!aborted) setLoading(false);
      }

      // helper to attach replies
      function attachRepliesToQueries(replyRows: ReplyItem[]) {
        setQueries((prev) =>
          prev.map((q) => {
            const repliesForQ = replyRows.filter((r) => String(r.query_id) === String(q.id));
            return {
              ...q,
              replies: repliesForQ,
              answered: (repliesForQ.length > 0) || q.answered,
            };
          })
        );
      }
    }

    load();
    return () => {
      aborted = true;
    };
  }, [/* no deps so loads once */]);

  // client-side filtering + search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queries.filter((item) => {
      if (filter === "answered" && !item.answered) return false;
      if (filter === "unanswered" && item.answered) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) || (item.body || "").toLowerCase().includes(q)
      );
    });
  }, [queries, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">My Queries</h3>
          <p className="text-sm text-slate-500">Your submitted queries.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-2 py-1">
            <button onClick={() => setFilter("all")} className={`px-2 py-1 rounded-md text-sm ${filter === "all" ? "bg-white shadow" : ""}`}>All</button>
            <button onClick={() => setFilter("answered")} className={`px-2 py-1 rounded-md text-sm ${filter === "answered" ? "bg-white shadow" : ""}`}>Answered</button>
            <button onClick={() => setFilter("unanswered")} className={`px-2 py-1 rounded-md text-sm ${filter === "unanswered" ? "bg-white shadow" : ""}`}>Unanswered</button>
          </div>

          <div className="flex items-center gap-2">
            <input aria-label="Search queries" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or body..." className="px-3 py-2 border rounded-md text-sm w-48 focus:outline-none focus:ring" />
            <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-sm px-3 py-2 bg-slate-100 rounded-md">Reset</button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-md shadow-sm">
        {loading ? (
          <div className="p-6 text-center">Loading your queries…</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-600">No queries found. Try creating one.</div>
        ) : (
          <div>
            <div className="divide-y">
              {pageItems.map((q) => (
                <div key={q.id} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                  <div className="w-3/4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-md">{q.title}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${q.answered ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{q.answered ? "Answered" : "Unanswered"}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{q.body}</p>
                    <div className="text-xs text-slate-400 mt-2">Asked on {new Date(q.createdAt).toLocaleString()}</div>

                    {/* Show first reply preview if present */}
                    {q.replies && q.replies.length > 0 && (
                      <div className="mt-3 p-3 bg-slate-50 rounded border">
                        <div className="text-sm font-medium">Top answer</div>
                        <div className="text-sm text-slate-700 mt-1 line-clamp-3">{q.replies[0].body}</div>
                        <div className="text-xs text-slate-400 mt-2">Answered on {q.replies[0].created_at ? new Date(q.replies[0].created_at).toLocaleString() : ""}</div>
                      </div>
                    )}
                  </div>

                  <div className="w-1/4 flex flex-col items-end gap-2">
                    <button onClick={() => (window.location.href = `/queries/${q.id}`)} className="px-3 py-2 border rounded-md text-sm w-full">View</button>

                    {/* Hide Reply button if current user is the owner of the query */}
                    {currentUserId && String(currentUserId) !== String(q.ownerId) && (
                      <button onClick={() => (window.location.href = `/queries/${q.id}/reply`)} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm w-full">Reply</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 flex items-center justify-between">
              <div className="text-sm text-slate-600">Showing {pageItems.length} of {filtered.length} results</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Prev</button>
                <div className="px-3 py-1 border rounded-md">{page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

