-- Fix province column schema issue
-- Add missing 'province' column and ensure proper South African province validation

-- First, check if 'province' column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'province') THEN
        ALTER TABLE user_profiles ADD COLUMN province TEXT;
        
        -- If 'provinces' column exists, copy data to 'province' column
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'provinces') THEN
            UPDATE user_profiles SET province = provinces WHERE provinces IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Add check constraint for South African provinces
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'user_profiles' AND constraint_name = 'user_profiles_province_check') THEN
        ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_province_check;
    END IF;
    
    -- Add new constraint for South African provinces
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_province_check 
    CHECK (province IS NULL OR province IN (
        'Western Cape',
        'Gauteng', 
        'KwaZulu-Natal',
        'Eastern Cape',
        'Limpopo',
        'Mpumalanga',
        'North West',
        'Northern Cape',
        'Free State'
    ));
END $$;

-- Create index for province column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_province ON user_profiles(province);

-- Update any NULL provinces with a default if city information is available
UPDATE user_profiles 
SET province = CASE 
    WHEN city IN ('Cape Town', 'Stellenbosch', 'George', 'Hermanus', 'Paarl') THEN 'Western Cape'
    WHEN city IN ('Johannesburg', 'Pretoria', 'Sandton', 'Centurion', 'Randburg') THEN 'Gauteng'
    WHEN city IN ('Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay') THEN 'KwaZulu-Natal'
    WHEN city IN ('Port Elizabeth', 'East London', 'Grahamstown', 'Uitenhage') THEN 'Eastern Cape'
    WHEN city IN ('Polokwane', 'Tzaneen', 'Mokopane', 'Thohoyandou') THEN 'Limpopo'
    WHEN city IN ('Nelspruit', 'Witbank', 'Secunda', 'Standerton') THEN 'Mpumalanga'
    WHEN city IN ('Rustenburg', 'Klerksdorp', 'Potchefstroom', 'Mahikeng') THEN 'North West'
    WHEN city IN ('Kimberley', 'Upington', 'Springbok', 'De Aar') THEN 'Northern Cape'
    WHEN city IN ('Bloemfontein', 'Welkom', 'Kroonstad', 'Bethlehem') THEN 'Free State'
    ELSE province
END
WHERE province IS NULL AND city IS NOT NULL;
