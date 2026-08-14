-- Add profile_completion_percentage column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 10;

-- Add onboarding_completed column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have a base completion percentage
UPDATE user_profiles 
SET profile_completion_percentage = 10
WHERE profile_completion_percentage IS NULL;

-- Create index for faster queries on profile completion
CREATE INDEX IF NOT EXISTS idx_user_profiles_completion 
ON user_profiles(profile_completion_percentage);

-- Create index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding 
ON user_profiles(onboarding_completed);
