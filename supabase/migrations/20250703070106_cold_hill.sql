/*
  # Create category requests table

  1. New Tables
    - `category_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `requested_category_group` (text)
      - `requested_category_name` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `category_requests` table
    - Add policy for authenticated users to insert their own requests
    - Add policy for authenticated users to view their own requests
    - Add policy for admins to view all requests (future use)

  3. Indexes
    - Add index on user_id for performance
    - Add index on status for admin filtering
*/

CREATE TABLE IF NOT EXISTS category_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_category_group text NOT NULL,
  requested_category_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE category_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own category requests"
  ON category_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own category requests"
  ON category_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS category_requests_user_id_idx ON category_requests(user_id);
CREATE INDEX IF NOT EXISTS category_requests_status_idx ON category_requests(status);

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at_category_requests
  BEFORE UPDATE ON category_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();