-- Update database schema to support all 5 account types with client-specific fields
-- Update account type check constraint to include all 5 types
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_account_type_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_account_type_check 
CHECK (account_type IN ('film_crew', 'content_creator', 'studio', 'store', 'scout'));

-- Add client-specific fields for studios, stores, and scouts
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS services_needed TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS typical_budget_range TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS content_needs TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS project_types TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS casting_focus TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS talent_types TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS client_base_info TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_name ON user_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON user_profiles(industry);

-- Update RLS policies to handle all account types
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
