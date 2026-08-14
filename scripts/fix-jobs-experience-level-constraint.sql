-- First, drop the existing constraint if it exists
ALTER TABLE public.gigs DROP CONSTRAINT IF EXISTS gigs_experience_level_check;

-- Add a new constraint that accepts lowercase values without hyphens
ALTER TABLE public.gigs
ADD CONSTRAINT gigs_experience_level_check
CHECK (experience_level IN ('entry', 'mid', 'senior', 'expert'));

-- Update existing rows to use the new format (if any exist)
UPDATE public.gigs
SET experience_level = CASE 
  WHEN LOWER(experience_level) LIKE '%entry%' OR LOWER(experience_level) LIKE '%junior%' THEN 'entry'
  WHEN LOWER(experience_level) LIKE '%mid%' THEN 'mid'
  WHEN LOWER(experience_level) LIKE '%senior%' THEN 'senior'
  WHEN LOWER(experience_level) LIKE '%expert%' OR LOWER(experience_level) LIKE '%lead%' THEN 'expert'
  ELSE 'mid'
END
WHERE experience_level IS NOT NULL;
