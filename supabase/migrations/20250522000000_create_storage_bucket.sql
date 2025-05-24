
-- Create a storage bucket for public uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public', 'public', true);

-- Set up policy for public access to bucket objects
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'public');

-- Allow users to update their own objects
CREATE POLICY "Allow authenticated updates" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'public' AND owner = auth.uid());

-- Allow users to delete their own objects
CREATE POLICY "Allow authenticated deletes" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'public' AND owner = auth.uid());
