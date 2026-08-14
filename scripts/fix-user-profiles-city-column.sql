-- Fix for missing 'city' column in user_profiles table
-- This addresses the error: "Could not find the 'city' column of 'user_profiles' in the schema cache"

-- Add the missing city column if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Optional: Copy data from 'cities' column to 'city' column if cities column exists
-- Uncomment the following lines if you want to migrate data:
-- UPDATE user_profiles 
-- SET city = cities 
-- WHERE city IS NULL AND cities IS NOT NULL;

-- Add an index for better performance on city searches
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('city', 'cities', 'location')
ORDER BY column_name;
