/*
  # Add account type to profiles

  1. Schema Changes
    - Add `account_type` column to profiles table
    - Set default value and add constraint for valid types
    - Add index for better performance

  2. Valid account types
    - 'person' - Individual users
    - 'business' - Business/Company accounts  
    - 'education' - Educational Institution accounts

  3. Migration
    - Add column with default value
    - Update existing profiles to 'person' type
*/

-- Add account_type column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_type text DEFAULT 'person' CHECK (account_type IN ('person', 'business', 'education'));
  END IF;
END $$;

-- Create index for better performance when filtering by account type
CREATE INDEX IF NOT EXISTS profiles_account_type_idx ON profiles(account_type);

-- Update existing profiles to have 'person' as default account type
UPDATE profiles SET account_type = 'person' WHERE account_type IS NULL;

-- Make account_type NOT NULL after setting defaults
ALTER TABLE profiles ALTER COLUMN account_type SET NOT NULL;