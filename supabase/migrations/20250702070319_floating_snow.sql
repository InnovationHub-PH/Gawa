/*
  # Complete Profile Pictures Implementation

  1. Storage Bucket Setup
     - Create profile-pictures bucket with public access
     - Set file size and type restrictions
     - Configure RLS policies for secure access

  2. New Tables
     - `profile_pictures`
       - `id` (uuid, primary key)
       - `user_id` (uuid, foreign key to profiles.id, unique)
       - `image_data` (text, base64 encoded image)
       - `content_type` (text, MIME type)
       - `file_size` (integer, size in bytes)
       - `uploaded_at` (timestamptz, creation timestamp)

  3. Security
     - Enable RLS on profile_pictures table
     - Storage bucket policies for user file management
     - Database policies for profile picture records
     - Constraints for data integrity and size limits
*/

-- Create the profile-pictures storage bucket
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

-- Storage bucket policies
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

-- Create profile_pictures table
CREATE TABLE IF NOT EXISTS profile_pictures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_data text NOT NULL,
  content_type text NOT NULL,
  file_size integer NOT NULL CHECK (file_size <= 5242880), -- 5MB limit
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS on profile_pictures table
ALTER TABLE profile_pictures ENABLE ROW LEVEL SECURITY;

-- Public read access to all profile pictures
CREATE POLICY "Public can view all profile pictures"
  ON profile_pictures
  FOR SELECT
  USING (true);

-- Users can insert their own profile picture
CREATE POLICY "Users can insert their own profile picture"
  ON profile_pictures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile picture
CREATE POLICY "Users can update their own profile picture"
  ON profile_pictures
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own profile picture
CREATE POLICY "Users can delete their own profile picture"
  ON profile_pictures
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS profile_pictures_user_id_idx ON profile_pictures(user_id);

-- Update the handle_updated_at trigger for profile_pictures if needed
CREATE TRIGGER handle_updated_at_profile_pictures
  BEFORE UPDATE ON profile_pictures
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();