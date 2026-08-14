-- Adding comprehensive account type system for film crew vs content creators
-- Update user_profiles table to support account types and specializations
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_type TEXT CHECK (account_type IN ('film_crew', 'content_creator'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS specializations TEXT[]; -- Array of specializations
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS travel_willingness TEXT CHECK (travel_willingness IN ('local', 'provincial', 'national', 'international'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS remote_capable BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sample_work_urls TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS rate_structure TEXT CHECK (rate_structure IN ('hourly', 'daily', 'project'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS project_rate_min DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS project_rate_max DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS equipment_owned TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS contact_preferences TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_specializations ON user_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_user_profiles_travel_willingness ON user_profiles(travel_willingness);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
