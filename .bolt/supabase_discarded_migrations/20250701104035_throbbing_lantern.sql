/*
  # Create profile_pictures table

  1. New Tables
    - `profile_pictures`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `image_data` (text, base64 encoded image)
      - `content_type` (text, MIME type)
      - `file_size` (integer, size in bytes)
      - `uploaded_at` (timestamptz, creation timestamp)
      - Unique constraint on user_id (one picture per user)

  2. Security
    - Enable RLS on `profile_pictures` table
    - Add policy for public read access to all profile pictures
    - Add policy for authenticated users to insert their own profile picture
    - Add policy for authenticated users to update their own profile picture
    - Add policy for authenticated users to delete their own profile picture

  3. Constraints
    - Foreign key constraint to profiles table with CASCADE delete
    - Unique constraint to ensure one profile picture per user
    - Check constraint to limit file size to 5MB (5,242,880 bytes)
*/

-- Create the profile_pictures table
CREATE TABLE IF NOT EXISTS profile_pictures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_data text NOT NULL,
  content_type text NOT NULL DEFAULT 'image/jpeg',
  file_size integer DEFAULT 0,
  uploaded_at timestamptz DEFAULT now(),
  
  -- Ensure one profile picture per user
  CONSTRAINT unique_user_profile_picture UNIQUE(user_id),
  
  -- Limit file size to 5MB (base64 encoded, so ~6.7MB in base64)
  CONSTRAINT check_file_size CHECK (file_size <= 5242880),
  
  -- Ensure valid content types
  CONSTRAINT check_content_type CHECK (
    content_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp')
  )
);

-- Enable Row Level Security
ALTER TABLE profile_pictures ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profile pictures (public read)
CREATE POLICY "Public can view all profile pictures"
  ON profile_pictures
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can insert their own profile picture
CREATE POLICY "Users can insert their own profile picture"
  ON profile_pictures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own profile picture
CREATE POLICY "Users can update their own profile picture"
  ON profile_pictures
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own profile picture
CREATE POLICY "Users can delete their own profile picture"
  ON profile_pictures
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_profile_pictures_user_id ON profile_pictures(user_id);

-- Create index for faster lookups by uploaded_at (for potential cleanup operations)
CREATE INDEX IF NOT EXISTS idx_profile_pictures_uploaded_at ON profile_pictures(uploaded_at);