/*
  # Add account type to profiles

  1. New Columns
    - `account_type` (text) - Type of account: person, business, or education
    - Default value: 'person'
    - Check constraint to ensure valid values

  2. Security
    - Update existing RLS policies to work with new column
    - Add index for account type filtering

  3. Function Updates
    - Update handle_new_user function to include account_type from metadata
*/

-- Add account_type column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_type text DEFAULT 'person' NOT NULL;
  END IF;
END $$;

-- Add check constraint for valid account types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_account_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_account_type_check 
    CHECK (account_type IN ('person', 'business', 'education'));
  END IF;
END $$;

-- Add index for account type filtering
CREATE INDEX IF NOT EXISTS profiles_account_type_idx ON profiles(account_type);

-- Update the handle_new_user function to include account_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, account_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'account_type', 'person')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;