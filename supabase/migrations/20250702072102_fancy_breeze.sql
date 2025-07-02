/*
  # Fix Profile Pictures Storage

  1. Updates
    - Update existing profile_pictures table structure
    - Add proper columns and constraints
    - Set up storage bucket and policies
    - Ensure compatibility with existing data

  2. Security
    - Enable RLS on profile_pictures table
    - Add policies for authenticated users to manage their own pictures
    - Add policies for public read access
    - Set up storage bucket policies

  3. Storage
    - Create profile-pictures storage bucket
    - Set file size and type restrictions
    - Enable public access for viewing
*/

-- First, let's check and update the existing profile_pictures table
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_pictures' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profile_pictures ADD COLUMN user_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_pictures' AND column_name = 'image_data'
  ) THEN
    ALTER TABLE profile_pictures ADD COLUMN image_data text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_pictures' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE profile_pictures ADD COLUMN content_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_pictures' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE profile_pictures ADD COLUMN file_size integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_pictures' AND column_name = 'uploaded_at'
  ) THEN
    ALTER TABLE profile_pictures ADD COLUMN uploaded_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_pictures' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profile_pictures ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profile_pictures_user_id_fkey'
  ) THEN
    ALTER TABLE profile_pictures 
    ADD CONSTRAINT profile_pictures_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add file size check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profile_pictures_file_size_check'
  ) THEN
    ALTER TABLE profile_pictures 
    ADD CONSTRAINT profile_pictures_file_size_check 
    CHECK (file_size <= 5242880); -- 5MB limit
  END IF;

  -- Add unique constraint on user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profile_pictures_user_id_key'
  ) THEN
    ALTER TABLE profile_pictures 
    ADD CONSTRAINT profile_pictures_user_id_key 
    UNIQUE (user_id);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS profile_pictures_user_id_idx ON profile_pictures(user_id);

-- Enable RLS on profile_pictures table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'profile_pictures' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE profile_pictures ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public can view all profile pictures" ON profile_pictures;
DROP POLICY IF EXISTS "Users can insert their own profile picture" ON profile_pictures;
DROP POLICY IF EXISTS "Users can update their own profile picture" ON profile_pictures;
DROP POLICY IF EXISTS "Users can delete their own profile picture" ON profile_pictures;

-- Create RLS policies for profile_pictures table
CREATE POLICY "Public can view all profile pictures"
  ON profile_pictures
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile picture"
  ON profile_pictures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile picture"
  ON profile_pictures
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile picture"
  ON profile_pictures
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at timestamp
DROP TRIGGER IF EXISTS handle_updated_at_profile_pictures ON profile_pictures;
CREATE TRIGGER handle_updated_at_profile_pictures
  BEFORE UPDATE ON profile_pictures
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

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

-- Drop existing storage policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;

-- Storage bucket policies
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (string_to_array(name, '-'))[1]
);

CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (string_to_array(name, '-'))[1]
);

CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (string_to_array(name, '-'))[1]
);

CREATE POLICY "Public can view profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');