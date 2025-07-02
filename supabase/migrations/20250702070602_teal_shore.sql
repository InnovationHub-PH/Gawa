/*
  # Profile Pictures Storage and Table Setup

  1. Storage Setup
    - Create profile-pictures bucket with public access
    - Set 5MB file size limit and allowed image types
    - Set up RLS policies for storage operations

  2. New Tables
    - profile_pictures table for storing base64 image data
    - Foreign key to profiles table
    - Unique constraint (one picture per user)
    - File size limit check constraint

  3. Security
    - Enable RLS on profile_pictures table
    - Public read access to all profile pictures
    - Users can only manage their own profile pictures
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
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS profile_pictures_user_id_idx ON profile_pictures(user_id);

-- Enable RLS on profile_pictures table
ALTER TABLE profile_pictures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_pictures table
-- Public read access to all profile pictures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profile_pictures' 
    AND policyname = 'Public can view all profile pictures'
  ) THEN
    CREATE POLICY "Public can view all profile pictures"
      ON profile_pictures
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Users can insert their own profile picture
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profile_pictures' 
    AND policyname = 'Users can insert their own profile picture'
  ) THEN
    CREATE POLICY "Users can insert their own profile picture"
      ON profile_pictures
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own profile picture
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profile_pictures' 
    AND policyname = 'Users can update their own profile picture'
  ) THEN
    CREATE POLICY "Users can update their own profile picture"
      ON profile_pictures
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can delete their own profile picture
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profile_pictures' 
    AND policyname = 'Users can delete their own profile picture'
  ) THEN
    CREATE POLICY "Users can delete their own profile picture"
      ON profile_pictures
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create trigger for updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_profile_pictures'
  ) THEN
    CREATE TRIGGER handle_updated_at_profile_pictures
      BEFORE UPDATE ON profile_pictures
      FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END $$;