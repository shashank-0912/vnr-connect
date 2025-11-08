import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";


type Props = {
  open: boolean;
  onClose: () => void;
  queryId: string;
  currentUserId: string;
  onReplyCreated?: (reply: any) => void;
};

export function ReplyModal({ open, onClose, queryId, currentUserId, onReplyCreated }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async () => {
    setError("");
    if (text.trim().length < 3) {
      setError("Please write a longer reply.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: supErr } = await supabase
        .from("replies")
        .insert([{ query_id: queryId, author_id: currentUserId, text }])
        .select()
        .single();

      if (supErr) throw supErr;

      setText("");
      onClose();
      if (onReplyCreated) onReplyCreated(data);
    } catch (e: any) {
      setError(e.message || "Failed to post reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => { if(!loading) onClose(); }} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-[#0f1724]">
        <h3 className="mb-2 text-lg font-semibold">Write a reply</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[100px] rounded-md border p-2"
          placeholder="Type your helpful answer (max 500 chars)"
          maxLength={500}
          disabled={loading}
        />
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded px-3 py-1" onClick={() => { if(!loading) onClose(); }}>
            Cancel
          </button>
          <button
            className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-60"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Posting…" : "Post Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
