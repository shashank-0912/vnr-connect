-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('query', 'reply', 'resource', 'alumni_post')),
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 80),
  reason TEXT NOT NULL CHECK (char_length(reason) >= 20 AND char_length(reason) <= 1000),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous BOOLEAN DEFAULT false,
  attachment_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(item_id, item_type, reporter_id)
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Authenticated users can create reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- Moderators and admins can view all reports
CREATE POLICY "Moderators can view all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('MODERATOR', 'ADMIN')
  )
);

-- Moderators can update report status
CREATE POLICY "Moderators can update reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('MODERATOR', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('MODERATOR', 'ADMIN')
  )
);

-- Create storage bucket for report attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-attachments', 'report-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report attachments
CREATE POLICY "Users can upload report attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Moderators can view all attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('MODERATOR', 'ADMIN')
  )
);

-- Function to create moderation log when report is created
CREATE OR REPLACE FUNCTION public.create_moderation_log_for_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.moderation_logs (
    item_type,
    item_id,
    action,
    admin_id,
    reason,
    timestamp
  ) VALUES (
    NEW.item_type,
    NEW.item_id,
    'reported',
    NEW.reporter_id,
    NEW.title || ': ' || NEW.reason,
    NEW.created_at
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create moderation log
CREATE TRIGGER create_moderation_log_on_report
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.create_moderation_log_for_report();

-- Add index for performance
CREATE INDEX idx_reports_item ON public.reports(item_id, item_type);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);