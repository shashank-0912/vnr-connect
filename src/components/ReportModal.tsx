import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemType: "query" | "reply" | "resource" | "alumni_post";
}

export const ReportModal = ({ open, onOpenChange, itemId, itemType }: ReportModalProps) => {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [reasonError, setReasonError] = useState("");

  const validateTitle = (value: string) => {
    if (value.length === 0) {
      setTitleError("Title is required");
      return false;
    }
    if (value.length > 80) {
      setTitleError("Title must be 80 characters or less");
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateReason = (value: string) => {
    if (value.length < 20) {
      setReasonError("Please explain the issue in at least 20 characters");
      return false;
    }
    if (value.length > 1000) {
      setReasonError("Reason must be 1000 characters or less");
      return false;
    }
    setReasonError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const uploadFile = async (userId: string): Promise<string | null> => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("report-attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("report-attachments")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload attachment");
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validate inputs
    const isTitleValid = validateTitle(title);
    const isReasonValid = validateReason(reason);

    if (!isTitleValid || !isReasonValid) {
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to report");
        return;
      }

      // Upload file if present
      let attachmentUrl: string | null = null;
      if (file) {
        attachmentUrl = await uploadFile(user.id);
      }

      // Create report
      const { error: reportError } = await supabase
        .from("reports")
        .insert({
          item_id: itemId,
          item_type: itemType,
          title: title.trim(),
          reason: reason.trim(),
          reporter_id: user.id,
          anonymous,
          attachment_url: attachmentUrl,
        });

      if (reportError) {
        // Check for duplicate report
        if (reportError.code === "23505") {
          toast.error("You already reported this item.");
          return;
        }
        throw reportError;
      }

      // Increment flags counter on the item
      // TODO: implement auto-hide logic after certain threshold (e.g., 3 validated reports)
      if (itemType === "query") {
        const { data: currentQuery } = await supabase
          .from("queries")
          .select("flags")
          .eq("id", itemId)
          .single();

        if (currentQuery) {
          await supabase
            .from("queries")
            .update({ flags: (currentQuery.flags || 0) + 1 })
            .eq("id", itemId);
        }
      }

      toast.success("Report submitted — moderators will review it. Thanks for helping keep VNR clean.");
      
      // Reset form and close modal
      setTitle("");
      setReason("");
      setAnonymous(false);
      setFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Report submission error:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = title.length >= 1 && title.length <= 80 && reason.length >= 20 && reason.length <= 1000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report this post</DialogTitle>
          <DialogDescription>
            Help us keep VNR Connect safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="report-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="report-title"
              placeholder="Short title e.g. 'Offensive language'"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                validateTitle(e.target.value);
              }}
              maxLength={80}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Short & clear helps moderators triage faster. ({title.length}/80)
            </p>
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
          </div>

          {/* Reason Textarea */}
          <div className="space-y-2">
            <Label htmlFor="report-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="report-reason"
              placeholder="Explain why this is a problem — be specific"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                validateReason(e.target.value);
              }}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include timestamps, user name, and exact quote if possible. ({reason.length}/1000)
            </p>
            {reasonError && (
              <p className="text-xs text-destructive">{reasonError}</p>
            )}
          </div>

          {/* File Attachment */}
          <div className="space-y-2">
            <Label htmlFor="report-attachment">
              Attach Screenshot/File <span className="text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="report-attachment"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Images or PDF, max 5MB
            </p>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="report-anonymous">Report anonymously</Label>
              <p className="text-xs text-muted-foreground">
                Your identity will be hidden from public view
              </p>
            </div>
            <Switch
              id="report-anonymous"
              checked={anonymous}
              onCheckedChange={setAnonymous}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
