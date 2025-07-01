/*
# Create profile pictures storage bucket

1. Storage Setup
   - Create profile-pictures bucket with public access
   - Set 5MB file size limit
   - Allow image file types only

2. Security Policies
   - Users can upload their own profile pictures
   - Users can update their own profile pictures  
   - Users can delete their own profile pictures
   - Public read access for all profile pictures

3. Notes
   - Uses Supabase storage functions instead of direct table access
   - File naming convention: {user_id}-{timestamp}.{extension}
*/

-- Create the profile-pictures bucket using Supabase storage functions
DO $$
BEGIN
  -- Insert bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'profile-pictures', 
    'profile-pictures', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
EXCEPTION
  WHEN others THEN
    -- Bucket might already exist, continue
    NULL;
END $$;

-- Create storage policies using Supabase's policy system
-- Note: These policies will be created if they don't already exist

-- Allow authenticated users to upload their own profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own profile pictures'
  ) THEN
    CREATE POLICY "Users can upload their own profile pictures"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profile-pictures' 
      AND auth.uid()::text = (string_to_array(name, '-'))[1]
    );
  END IF;
END $$;

-- Allow users to update their own profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own profile pictures'
  ) THEN
    CREATE POLICY "Users can update their own profile pictures"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'profile-pictures' 
      AND auth.uid()::text = (string_to_array(name, '-'))[1]
    );
  END IF;
END $$;

-- Allow users to delete their own profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own profile pictures'
  ) THEN
    CREATE POLICY "Users can delete their own profile pictures"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'profile-pictures' 
      AND auth.uid()::text = (string_to_array(name, '-'))[1]
    );
  END IF;
END $$;

-- Allow public read access to profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view profile pictures'
  ) THEN
    CREATE POLICY "Public can view profile pictures"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'profile-pictures');
  END IF;
END $$;