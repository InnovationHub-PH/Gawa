/*
  # Create Profile Pictures Storage and Table

  1. Storage Setup
    - Create profile-pictures bucket with public access
    - Set 5MB file size limit and allowed image types
    - Add storage policies for user access control

  2. New Tables
    - `profile_pictures`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id, unique)
      - `image_data` (text, base64 encoded image)
      - `content_type` (text, MIME type)
      - `file_size` (integer, size in bytes, max 5MB)
      - `uploaded_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on profile_pictures table
    - Public read access to all profile pictures
    - Users can insert/update/delete their own profile pictures
    - Storage policies for secure file operations
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

-- Create profile_pictures table
CREATE TABLE IF NOT EXISTS profile_pictures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  image_data text NOT NULL,
  content_type text NOT NULL,
  file_size integer NOT NULL CHECK (file_size <= 5242880), -- 5MB limit
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profile_pictures_user_id_fkey'
  ) THEN
    ALTER TABLE profile_pictures 
    ADD CONSTRAINT profile_pictures_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS profile_pictures_user_id_idx ON profile_pictures(user_id);

-- Enable RLS on profile_pictures table
ALTER TABLE profile_pictures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_pictures table
DO $$
BEGIN
  -- Public read access to all profile pictures
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

  -- Users can insert their own profile picture
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

  -- Users can update their own profile picture
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

  -- Users can delete their own profile picture
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

-- Storage bucket policies
DO $$
BEGIN
  -- Users can upload their own profile pictures
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

  -- Users can update their own profile pictures
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

  -- Users can delete their own profile pictures
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

  -- Public can view profile pictures
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