-- Add unique constraints for coach data import
-- Run this BEFORE running the import script to ensure data integrity

-- 1. Add unique constraint on governing body name
ALTER TABLE governing_bodies
ADD CONSTRAINT governing_bodies_name_key
UNIQUE (name);

-- 2. Add unique constraint on conference name
ALTER TABLE conferences
ADD CONSTRAINT conferences_name_key
UNIQUE (name);

-- 3. Add unique constraint on division name
ALTER TABLE divisions
ADD CONSTRAINT divisions_name_key
UNIQUE (name);

-- 4. Add unique constraint on university name
-- This prevents duplicate universities during import
ALTER TABLE universities
ADD CONSTRAINT universities_name_key
UNIQUE (name);

-- 5. Add unique constraint on coach full_name
-- This prevents duplicate coaches during import
-- Note: If coaches can have duplicate names, consider using email or another field
ALTER TABLE coaches
ADD CONSTRAINT coaches_full_name_key
UNIQUE (full_name);

-- 6. Add unique constraint on university_conferences composite key
-- This ensures one university can only be in one conference at a time (active record)
-- If a university can have multiple conference memberships, this constraint handles it
ALTER TABLE university_conferences
ADD CONSTRAINT university_conferences_unique_active
UNIQUE (university_id, conference_id);

-- 7. Add unique constraint on university_divisions composite key
-- This ensures one university can only be in one division at a time (active record)
ALTER TABLE university_divisions
ADD CONSTRAINT university_divisions_unique_active
UNIQUE (university_id, division_id);

-- 8. Add unique constraint on university_jobs composite key
-- This ensures one coach can only have one active job at a university
-- If a coach can have multiple jobs at the same university, remove this constraint
ALTER TABLE university_jobs
ADD CONSTRAINT university_jobs_coach_university_key
UNIQUE (coach_id, university_id);

-- Optional: Add indexes for faster lookups during import
CREATE INDEX IF NOT EXISTS idx_governing_bodies_name ON governing_bodies(name);
CREATE INDEX IF NOT EXISTS idx_conferences_name ON conferences(name);
CREATE INDEX IF NOT EXISTS idx_conferences_governing_body ON conferences(governing_body_id);
CREATE INDEX IF NOT EXISTS idx_divisions_name ON divisions(name);
CREATE INDEX IF NOT EXISTS idx_divisions_governing_body ON divisions(governing_body_id);
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_universities_ipeds ON universities(ipeds_nces_id);
CREATE INDEX IF NOT EXISTS idx_coaches_full_name ON coaches(full_name);
CREATE INDEX IF NOT EXISTS idx_university_conferences_university ON university_conferences(university_id);
CREATE INDEX IF NOT EXISTS idx_university_conferences_conference ON university_conferences(conference_id);
CREATE INDEX IF NOT EXISTS idx_university_divisions_university ON university_divisions(university_id);
CREATE INDEX IF NOT EXISTS idx_university_divisions_division ON university_divisions(division_id);
CREATE INDEX IF NOT EXISTS idx_university_jobs_coach_university ON university_jobs(coach_id, university_id);
