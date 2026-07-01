-- 008_storage_rls.sql

-- Enable RLS for storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Allow any authenticated user to upload to 'chat_attachments'
CREATE POLICY "Allow users to upload to chat_attachments"
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'chat_attachments');

-- 2. Allow anyone to view/read objects in 'chat_attachments'
CREATE POLICY "Allow public to read chat_attachments"
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat_attachments');

-- 3. Allow users to update their own files (optional, good practice)
CREATE POLICY "Allow users to update own chat_attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'chat_attachments' AND auth.uid() = owner);

-- 4. Allow users to delete their own files (optional, good practice)
CREATE POLICY "Allow users to delete own chat_attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat_attachments' AND auth.uid() = owner);
