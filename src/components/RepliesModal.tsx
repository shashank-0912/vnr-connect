import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Flag, Trash } from "lucide-react";
import { ReportModal } from "./ReportModal";


type Props = {
  open: boolean;
  onClose: () => void;
  queryId: string;
  currentUserId?: string | null;
  onPosted?: (reply: any) => void;
};

export default function RepliesModal({ open, onClose, queryId, currentUserId, onPosted }: Props) {
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItemId, setReportItemId] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    loadReplies();

    // subscribe to replies changes for this query
    const channel = supabase
      .channel(`replies-query-${queryId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "replies", filter: `query_id=eq.${queryId}` },
        () => {
          loadReplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, queryId]);

  const loadReplies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("replies")
        .select(`
          id,
          text,
          created_at,
          author_id,
          profiles (id, name)
        `)
        .eq("query_id", queryId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (e: any) {
      console.error("Failed to load replies", e);
    } finally {
      setLoading(false);
    }
  };

  const postReply = async () => {
    setError("");
    if (text.trim().length < 1) {
      setError("Type something to reply.");
      return;
    }
    setPosting(true);
    try {
      const payload = {
        query_id: queryId,
        author_id: currentUserId ?? null,
        text: text.trim(),
      };
      const { data, error } = await supabase.from("replies").insert([payload]).select(`
        id, text, created_at, author_id, profiles (id, name)
      `).single();

      if (error) throw error;
      setText("");
      if (onPosted) onPosted(data);
      setReplies((prev) => [...prev, data]);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Could not post reply");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!currentUserId) {
      setError("You must be signed in to delete.");
      return;
    }
    if (!confirm("Delete this reply? This action cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from("replies")
        .delete()
        .eq("id", replyId)
        .eq("author_id", currentUserId); // server-side safety expected too

      if (error) throw error;
      // optimistic UI
      setReplies(prev => prev.filter(r => r.id !== replyId));
    } catch (e: any) {
      setError(e.message || "Failed to delete reply");
    }
  };

  const openReportFor = (replyId: string) => {
    setReportItemId(replyId);
    setReportModalOpen(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => { if (!posting) onClose(); }} />
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-auto rounded-lg bg-white p-4 shadow-lg dark:bg-[#0f1724]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Replies</h3>
          <button className="text-sm text-muted-foreground" onClick={() => onClose()}>Close</button>
        </div>

        <div className="space-y-4">
          {/* composer */}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[80px] rounded-md border p-2"
              placeholder="Write a reply..."
              maxLength={1000}
              disabled={posting}
            />
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
            <div className="mt-2 flex justify-end">
              <button
                className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-60"
                onClick={postReply}
                disabled={posting}
              >
                {posting ? "Posting…" : "Reply"}
              </button>
            </div>
          </div>

          <hr />

          {/* replies list */}
          <div>
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading replies…</div>
            ) : replies.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No replies yet. Be the first!</div>
            ) : (
              <div className="space-y-3">
                {replies.map((r) => (
                  <div key={r.id} className="rounded border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{r.profiles?.name ?? (r.author_id ? "User" : "Anonymous")}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      {/* action buttons for each reply */}
                      <div className="flex items-center gap-2">
                        <button
                          className="text-sm flex items-center gap-2"
                          onClick={() => openReportFor(r.id)}
                        >
                          <Flag className="h-4 w-4" />
                          <span className="sr-only">Report</span>
                        </button>

                        {r.author_id === currentUserId && (
                          <button
                            className="text-sm flex items-center gap-2 text-red-600"
                            onClick={() => handleDeleteReply(r.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-foreground whitespace-pre-wrap">{r.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          itemId={reportItemId}
          itemType="reply"
        />
      </div>
    </div>
  );
}

