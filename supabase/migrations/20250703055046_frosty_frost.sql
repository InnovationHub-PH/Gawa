/*
  # Add location coordinates to profiles table

  1. New Columns
    - `latitude` (numeric) - Latitude coordinate for map display
    - `longitude` (numeric) - Longitude coordinate for map display
    - `location_type` (text) - Type of location (city, address, manual)
    - `geocoded_at` (timestamp) - When the location was last geocoded

  2. Indexes
    - Add spatial index for latitude/longitude queries
    - Add index for location searches

  3. Functions
    - Function to update coordinates when location changes
*/

-- Add coordinate columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_type text DEFAULT 'city' CHECK (location_type IN ('city', 'address', 'manual'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS geocoded_at timestamptz;

-- Create index for spatial queries
CREATE INDEX IF NOT EXISTS profiles_coordinates_idx ON profiles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index for location searches
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles (city, address) WHERE city IS NOT NULL;

-- Function to clear coordinates when location changes
CREATE OR REPLACE FUNCTION clear_coordinates_on_location_change()
RETURNS trigger AS $$
BEGIN
  -- If city or address changed, clear coordinates to trigger re-geocoding
  IF (OLD.city IS DISTINCT FROM NEW.city) OR (OLD.address IS DISTINCT FROM NEW.address) THEN
    NEW.latitude := NULL;
    NEW.longitude := NULL;
    NEW.geocoded_at := NULL;
    NEW.location_type := CASE 
      WHEN NEW.address IS NOT NULL AND NEW.address != '' THEN 'address'
      ELSE 'city'
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to clear coordinates when location changes
DROP TRIGGER IF EXISTS clear_coordinates_on_location_change ON profiles;
CREATE TRIGGER clear_coordinates_on_location_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION clear_coordinates_on_location_change();

-- Function to manually set coordinates
CREATE OR REPLACE FUNCTION set_profile_coordinates(
  user_uuid uuid,
  lat numeric,
  lng numeric
)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    latitude = lat,
    longitude = lng,
    location_type = 'manual',
    geocoded_at = now(),
    updated_at = now()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;