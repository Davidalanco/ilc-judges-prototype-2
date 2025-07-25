-- Setup Supabase Storage Buckets for Supreme Court Brief Workflow

-- Create audio files bucket (for attorney conversations)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio-files',
    'audio-files', 
    false,
    52428800, -- 50MB limit
    ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/x-m4a', 'audio/webm', 'audio/ogg', 'video/mp4', 'application/octet-stream']
);

-- Create documents bucket (for PDFs, briefs, research)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, 
    104857600, -- 100MB limit
    ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create exports bucket (for generated briefs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exports',
    'exports',
    true, -- Public for easy sharing
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for audio-files bucket
CREATE POLICY "Users can upload their own audio files" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'audio-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own audio files" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'audio-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own audio files" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'audio-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own audio files" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'audio-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for documents bucket  
CREATE POLICY "Users can upload their own documents" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for exports bucket (public read, user write)
CREATE POLICY "Users can upload their own exports" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view exports" ON storage.objects 
FOR SELECT USING (bucket_id = 'exports');

CREATE POLICY "Users can update their own exports" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own exports" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
