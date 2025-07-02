/*
  # Create Profile Pictures Table and Storage

  1. New Tables
    - `profile_pictures`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references profiles)
      - `image_data` (text, base64 fallback)
      - `storage_path` (text, Supabase Storage path)
      - `content_type` (text, MIME type)
      - `file_size` (integer, max 5MB)
      - `uploaded_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create profile-pictures bucket
    - Set up storage policies for secure access

  3. Security
    - Enable RLS on profile_pictures table
    - Add policies for user access control
    - Storage policies for file uploads
*/

-- Drop the existing profile_pictures table if it exists (since it's not properly configured)
DROP TABLE IF EXISTS profile_pictures CASCADE;

-- Create a completely new profile_pictures table
CREATE TABLE profile_pictures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_data text, -- Base64 encoded image data as fallback
  storage_path text, -- Path in Supabase Storage
  content_type text NOT NULL,
  file_size integer NOT NULL CHECK (file_size <= 5242880), -- 5MB limit
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX profile_pictures_user_id_idx ON profile_pictures(user_id);

-- Enable Row Level Security
ALTER TABLE profile_pictures ENABLE ROW LEVEL SECURITY;

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

-- Drop existing storage policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
EXCEPTION
  WHEN others THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create fresh storage bucket policies
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