-- Add account_type and display_name columns to profiles table
-- Run this script to add support for storing user account types and display names

-- Add account_type column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'creator';

-- Add display_name column  
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add comment to explain account_type values
COMMENT ON COLUMN profiles.account_type IS 'User account type: creator, scout, studio, or store';

-- Add comment to explain display_name
COMMENT ON COLUMN profiles.display_name IS 'User display name shown on profile cards and listings';

-- Update existing profiles to set display_name from full_name if null
UPDATE profiles 
SET display_name = full_name 
WHERE display_name IS NULL AND full_name IS NOT NULL;

-- Create index on account_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
