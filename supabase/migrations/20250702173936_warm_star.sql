/*
  # Profile Certification System

  1. New Tables
    - `profile_completion_steps` - tracks completion of each step
    - `profile_categories` - stores selected categories for each user
    
  2. Profile Updates
    - Add certification fields to profiles table
    - Add new profile fields for extended information
    
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add new fields to profiles table for certification system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_privacy text DEFAULT 'private' CHECK (address_privacy IN ('private', 'public'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_certified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certification_completed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;

-- Create profile completion steps table
CREATE TABLE IF NOT EXISTS profile_completion_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL CHECK (step_number >= 1 AND step_number <= 5),
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step_number)
);

-- Create profile categories table
CREATE TABLE IF NOT EXISTS profile_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_group text NOT NULL,
  category_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_group, category_name)
);

-- Enable RLS
ALTER TABLE profile_completion_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_completion_steps
CREATE POLICY "Users can view their own completion steps"
  ON profile_completion_steps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completion steps"
  ON profile_completion_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completion steps"
  ON profile_completion_steps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for profile_categories
CREATE POLICY "Users can view their own categories"
  ON profile_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON profile_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON profile_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON profile_categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can view categories for certified profiles
CREATE POLICY "Public can view categories for certified profiles"
  ON profile_categories
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_categories.user_id 
      AND profiles.is_certified = true
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_profile_completion_steps
  BEFORE UPDATE ON profile_completion_steps
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  completion_count integer := 0;
  total_steps integer := 5;
BEGIN
  -- Count completed steps
  SELECT COUNT(*) INTO completion_count
  FROM profile_completion_steps
  WHERE user_id = user_uuid AND is_completed = true;
  
  -- Return percentage
  RETURN (completion_count * 100 / total_steps);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if profile is eligible for certification
CREATE OR REPLACE FUNCTION check_certification_eligibility(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  completion_count integer := 0;
  required_steps integer := 5;
BEGIN
  -- Count completed steps
  SELECT COUNT(*) INTO completion_count
  FROM profile_completion_steps
  WHERE user_id = user_uuid AND is_completed = true;
  
  -- Return true if all steps are completed
  RETURN completion_count >= required_steps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update certification status
CREATE OR REPLACE FUNCTION update_certification_status(user_uuid uuid)
RETURNS void AS $$
DECLARE
  is_eligible boolean;
  completion_percentage integer;
BEGIN
  -- Calculate completion percentage
  completion_percentage := calculate_profile_completion(user_uuid);
  
  -- Check eligibility
  is_eligible := check_certification_eligibility(user_uuid);
  
  -- Update profile
  UPDATE profiles 
  SET 
    profile_completion_percentage = completion_percentage,
    is_certified = is_eligible,
    certification_completed_at = CASE 
      WHEN is_eligible AND certification_completed_at IS NULL THEN now()
      WHEN NOT is_eligible THEN NULL
      ELSE certification_completed_at
    END,
    updated_at = now()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update certification when steps change
CREATE OR REPLACE FUNCTION handle_step_completion_change()
RETURNS trigger AS $$
BEGIN
  -- Update certification status for the user
  PERFORM update_certification_status(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for step completion changes
DROP TRIGGER IF EXISTS on_step_completion_change ON profile_completion_steps;
CREATE TRIGGER on_step_completion_change
  AFTER INSERT OR UPDATE OR DELETE ON profile_completion_steps
  FOR EACH ROW EXECUTE FUNCTION handle_step_completion_change();

-- Update existing profiles to have initial completion steps
INSERT INTO profile_completion_steps (user_id, step_number, is_completed, completed_at)
SELECT 
  id as user_id,
  1 as step_number,
  (account_type IS NOT NULL) as is_completed,
  CASE WHEN account_type IS NOT NULL THEN created_at ELSE NULL END as completed_at
FROM profiles
ON CONFLICT (user_id, step_number) DO NOTHING;

INSERT INTO profile_completion_steps (user_id, step_number, is_completed, completed_at)
SELECT 
  id as user_id,
  2 as step_number,
  (full_name IS NOT NULL AND full_name != '') as is_completed,
  CASE WHEN full_name IS NOT NULL AND full_name != '' THEN created_at ELSE NULL END as completed_at
FROM profiles
ON CONFLICT (user_id, step_number) DO NOTHING;

-- Update certification status for all existing profiles
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id FROM profiles LOOP
    PERFORM update_certification_status(profile_record.id);
  END LOOP;
END $$;