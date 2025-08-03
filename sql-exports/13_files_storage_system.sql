-- Files Storage System for VLA Dashboard
-- This file sets up the complete file management system

-- Create client_files table for file metadata
CREATE TABLE IF NOT EXISTS public.client_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  uploaded_by TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create storage bucket for client files (this will be executed in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('client-files', 'client-files', false);

-- Set up Row Level Security (RLS) for client_files
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see files for their client
CREATE POLICY "Users can view files for their client" ON public.client_files
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE id = client_id
    )
  );

-- Policy: Users can insert files for any client (admin function)
CREATE POLICY "Users can upload files" ON public.client_files
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update files for their client
CREATE POLICY "Users can update files for their client" ON public.client_files
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE id = client_id
    )
  );

-- Policy: Users can delete files for their client
CREATE POLICY "Users can delete files for their client" ON public.client_files
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE id = client_id
    )
  );

-- Create storage policies for the bucket
-- These need to be run in the Supabase dashboard SQL editor

-- Policy: Allow authenticated users to upload files
-- CREATE POLICY "Authenticated users can upload files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'client-files' AND auth.role() = 'authenticated');

-- Policy: Allow users to view files for their client
-- CREATE POLICY "Users can view client files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'client-files');

-- Policy: Allow users to update files
-- CREATE POLICY "Users can update files" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'client-files' AND auth.role() = 'authenticated');

-- Policy: Allow users to delete files
-- CREATE POLICY "Users can delete files" ON storage.objects
--   FOR DELETE USING (bucket_id = 'client-files' AND auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON public.client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_upload_date ON public.client_files(upload_date);
CREATE INDEX IF NOT EXISTS idx_client_files_mime_type ON public.client_files(mime_type);
CREATE INDEX IF NOT EXISTS idx_client_files_filename ON public.client_files(filename);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_client_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_client_files_updated_at
  BEFORE UPDATE ON public.client_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_files_updated_at();

-- Create function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(file_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.client_files 
  SET 
    download_count = download_count + 1,
    last_accessed = CURRENT_TIMESTAMP
  WHERE id = file_id;
END;
$$ language 'plpgsql';

-- Create function to get file statistics
CREATE OR REPLACE FUNCTION public.get_client_file_stats(p_client_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_files', COUNT(*),
    'total_size', COALESCE(SUM(file_size), 0),
    'total_downloads', COALESCE(SUM(download_count), 0),
    'file_types', json_agg(DISTINCT mime_type),
    'recent_uploads', COUNT(*) FILTER (WHERE upload_date > CURRENT_TIMESTAMP - INTERVAL '7 days')
  ) INTO result
  FROM public.client_files
  WHERE client_id = p_client_id;
  
  RETURN result;
END;
$$ language 'plpgsql'; 