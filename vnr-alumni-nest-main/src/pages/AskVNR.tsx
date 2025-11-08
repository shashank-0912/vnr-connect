import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, ThumbsUp, Flag, CheckCircle, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ReportModal } from "@/components/ReportModal"; 
import { ReplyModal } from "../components/ReplyModal.tsx";
import RepliesModal from "../components/RepliesModal";
import AskQuickSuggestions from "../components/AskQuickSuggestions";


interface Query {
  id: string;
  text: string;
  category: string;
  anonymous: boolean;
  status: string;
  votes: number;
  flags: number;
  created_at: string;
  profiles: {
    name: string;
  } | null;
  replies: { count: number }[]; // supabase count relation shape
  author_id?: string | null;
}

const AskVNR = () => {
  // --- Reply modal state + helper setup ---
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [localRepliesCount, setLocalRepliesCount] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [repliesOpenFor, setRepliesOpenFor] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    })();
  }, []);

  const handleReplyCreated = (queryId: string, newReply: any) => {
    setLocalRepliesCount(prev => ({
      ...prev,
      [queryId]: (prev[queryId] || 0) + 1,
    }));
  };
  // --- end Reply modal setup ---

  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newQuery, setNewQuery] = useState("");
  const [category, setCategory] = useState<"ACADEMICS" | "INTERNSHIPS" | "ADMIN" | "PROJECT" | "EVENTS">("ACADEMICS");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItemId, setReportItemId] = useState<string>("");

  useEffect(() => {
    loadQueries();

    // Real-time subscription
    const channel = supabase
      .channel('queries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queries'
        },
        () => {
          loadQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('queries')
        .select(`
          *,
          author_id,
          profiles (name),
          replies (count)
        `)
        .eq('hidden', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setQueries(data || []);
    } catch (error: any) {
      toast.error("Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newQuery.trim() || newQuery.length > 200) {
      toast.error("Please enter a query (max 200 characters)");
      return;
    }

    // Simple profanity check
    const profanityWords = ['badword1', 'badword2']; // Add more
    const containsProfanity = profanityWords.some(word => 
      newQuery.toLowerCase().includes(word)
    );

    if (containsProfanity) {
      toast.error("Please keep it clean — rephrase.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('queries')
        .insert([{
          text: newQuery,
          category,
          anonymous,
          author_id: anonymous ? null : user.id,
        }]);

      if (error) throw error;

      toast.success("Query posted!");
      setNewQuery("");
      setDialogOpen(false);
      // reload queries so new one appears
      loadQueries();
    } catch (error: any) {
      toast.error(error.message || "Failed to post query");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (queryId: string, currentVotes: number) => {
    try {
      const { error } = await supabase
        .from('queries')
        .update({ votes: currentVotes + 1 })
        .eq('id', queryId);

      if (error) throw error;
      loadQueries();
    } catch (error) {
      toast.error("Failed to upvote");
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (!currentUserId) {
      toast.error("You must be signed in to delete.");
      return;
    }
    if (!confirm("Delete this query? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from('queries')
        .delete()
        .eq('id', queryId)
        .eq('author_id', currentUserId); // server-side safe check too

      if (error) throw error;
      toast.success("Query deleted");
      loadQueries();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete query");
    }
  };

  const handleOpenReportModal = (queryId: string) => {
    setReportItemId(queryId);
    setReportModalOpen(true);
  };

  if (loading) {
    return <div>Loading queries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Ask VNR</h1>
          <p className="text-muted-foreground">Get quick answers from peers and seniors</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Ask Quick
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Post a Query</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACADEMICS">Academics</SelectItem>
                    <SelectItem value="INTERNSHIPS">Internships</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                    <SelectItem value="EVENTS">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Your Question (max 200 chars)</Label>
                <Textarea
                  placeholder="What's your question?"
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  maxLength={200}
                  rows={4}
                />
                {/* AskQuick suggestions integrated here — clicking a suggestion fills the textarea */}
                <div className="mt-2">
                  <AskQuickSuggestions
                    query={newQuery}
                    onSelect={(it) => setNewQuery(it.text)}
                    minChars={3}
                    limit={6}
                  />
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  {newQuery.length}/200
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="anonymous"
                    checked={anonymous}
                    onCheckedChange={setAnonymous}
                  />
                  <Label htmlFor="anonymous">Post anonymously</Label>
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !newQuery.trim()}
                className="w-full"
              >
                {submitting ? "Posting..." : "Post Query"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {queries.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
          <p className="text-muted-foreground mb-4">Be the first — ask something quick!</p>
          <Button onClick={() => setDialogOpen(true)}>Post First Query</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <Card key={query.id} className="p-6 hover-lift">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>
                    {query.anonymous ? "?" : query.profiles?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {query.anonymous ? "Anonymous" : query.profiles?.name}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                      </span>
                      <Badge variant="outline">{query.category}</Badge>
                      {query.status === "SOLVED" && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Solved
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground">{query.text}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(query.id, query.votes)}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {query.votes}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRepliesOpenFor(query.id)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {(localRepliesCount[query.id] ?? query.replies?.[0]?.count ?? 0)} Replies
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenReportModal(query.id)}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </Button>

                      {query.author_id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuery(query.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReplyModal
        open={!!replyOpenFor}
        onClose={() => setReplyOpenFor(null)}
        queryId={replyOpenFor ?? ""}
        currentUserId={currentUserId ?? ""}
        onReplyCreated={(reply) => {
          if (reply?.query_id) handleReplyCreated(reply.query_id, reply);
          setReplyOpenFor(null);
          // optional: reload queries if needed
          // loadQueries();
        }}
      />

      <RepliesModal
        open={!!repliesOpenFor}
        onClose={() => setRepliesOpenFor(null)}
        queryId={repliesOpenFor ?? ""}
        currentUserId={currentUserId ?? null}
        onPosted={(reply) => {
          if (reply?.query_id) handleReplyCreated(reply.query_id, reply);
        }}
      />

      <ReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        itemId={reportItemId}
        itemType="query"
      />
    </div>
  );
};

export default AskVNR;
