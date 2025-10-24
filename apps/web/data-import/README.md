# Coach Data Import

This directory contains scripts to import coach data from the "Coach List.xlsx" file into the database.

## 📋 Data Structure

The Excel file contains 4 sheets:

1. **OG Data Combined** - Original client data (NOT USED for import)
2. **Upload - Unversities** - University information (2,590 rows)
3. **Upload - coaches** - Coach profiles (6,277 rows)
4. **Upload - University Jobs** - Coach-University relationships (5,510 rows)

## 🗄️ Database Schema

### Tables Affected

#### 1. `governing_bodies`
Extracted from: **Upload - Unversities** sheet ("governing body" column)

**Fields:**
- `name` → Governing body name (e.g., "NCAA", "NAIA", "NJCAA")
- `notes` → null

#### 2. `conferences`
Extracted from: **Upload - Unversities** sheet ("conference" column)

**Fields:**
- `name` → Conference name (e.g., "Southwestern Athletic Conference (SWAC)")
- `governing_body_id` → FK to governing_bodies
- `is_active` → true

#### 3. `divisions`
Extracted from: **Upload - Unversities** sheet ("divison" column - note typo in CSV)

**Fields:**
- `name` → Division name (e.g., "D1", "D2", "D3")
- `level` → Extracted level (e.g., "1", "2", "3")
- `governing_body_id` → FK to governing_bodies
- `is_active` → true

#### 4. `universities`
Maps to: **Upload - Unversities** sheet

**Fields from CSV:**
- `name` → name
- `state` → state
- `city` → city
- `region` → region
- `ipeds_nces_id` → ipeds_nces_id
- `religious_affiliation` → religious_affiliation
- `average_gpa` → average_gpa
- `us_news_ranking_national_2018` → us_news_ranking_national_2018
- `us_news_ranking_liberal_arts_2018` → us_news_ranking_liberal_arts_2018
- `majors_offered_url` → majors_offered_url
- `sat_ebrw_25th` → sat_ebrw_25th
- `sat_ebrw_75th` → sat_ebrw_75th
- `sat_math_25th` → sat_math_25th
- `sat_math_75th` → sat_math_75th
- `act_composite_25th` → act_composite_25th
- `act_composite_75th` → act_composite_75th
- `acceptance_rate_pct` → acceptance_rate_pct (parsed from "86.83%" to 86.83)

**Note:** `conference_raw` and `division_raw` fields have been removed. Use join tables instead.

#### 5. `university_conferences`
Join table linking universities to conferences

**Fields:**
- `university_id` → FK to universities
- `conference_id` → FK to conferences
- `start_date` → Date of import (current date)
- `end_date` → null
- `notes` → null

#### 6. `university_divisions`
Join table linking universities to divisions

**Fields:**
- `university_id` → FK to universities
- `division_id` → FK to divisions
- `start_date` → Date of import (current date)
- `end_date` → null
- `notes` → null

#### 7. `coaches`
Maps to: **Upload - coaches** sheet

**Fields from CSV:**
- `full_name` → full_name
- `twitter_profile` → twitter_profile
- `linkedin_profile` → linkedin_profile
- `instagram_profile` → instagram_profile
- `primary_specialty` → primary_specialty (event_group_enum - may need mapping)

#### 8. `university_jobs`
Maps to: **Upload - University Jobs** sheet

**Fields from CSV:**
- `coach_id` (coach name) → coach_id (lookup from coaches table)
- `university_id` (university name) → university_id (lookup from universities table)
- `job_title` → job_title
- `work_email` → work_email
- `work_phone` → work_phone

**Relationships:**
- Links to `coaches.id`
- Links to `universities.id`

## 🚀 Running the Import

### Prerequisites

1. **Environment Variables** - Add to `apps/web/.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Important**: Use the **service role key**, not the anon key, as this has admin privileges needed for bulk imports.

2. **Dependencies** - Already installed via root package.json:
```bash
bun install  # If not already done
```

### Run the Import

```bash
# From project root - load env vars from apps/web/.env
bun --env-file=apps/web/.env apps/web/data-import/import-coach-data.ts
```

### What Happens

The script will automatically:

1. **Clean existing data** - Removes previously imported data (keeps manually created records with dependencies)
2. **Load Excel file** - Reads all three "Upload" sheets
3. **Import Governing Bodies** (~5 unique)
   - Extracts from "governing body" column
   - Creates/updates governing bodies
4. **Import Conferences** (~154 unique)
   - Extracts from "conference" column
   - Links to governing bodies
5. **Import Divisions** (~3 unique)
   - Extracts from "divison" column
   - Links to governing bodies
6. **Import Universities** (~1,257 rows)
   - Creates/updates universities (without conference/division)
   - Builds lookup map (name → id)
7. **Link Universities to Conferences** (~1,257 links)
   - Creates university_conferences records
8. **Link Universities to Divisions** (~914 links)
   - Creates university_divisions records
9. **Import Coaches** (~6,276 rows)
   - Creates/updates coaches
   - Builds lookup map (name → id)
10. **Import University Jobs** (~5,499 rows)
    - Links coaches to universities
    - Uses lookup maps to resolve IDs
    - ~10 records skipped due to name mismatches in source data

### Output

```
🚀 Starting coach data import...

📊 Loaded data:
   - 2590 universities
   - 6277 coaches
   - 5510 university jobs

🏛️  Importing governing bodies...
Found 3 unique governing bodies
✅ Governing Bodies: 3 imported

🏈 Importing conferences...
Found 300 unique conferences
✅ Conferences: 300 imported

🎯 Importing divisions...
Found 10 unique divisions
✅ Divisions: 10 imported

📚 Importing 2590 universities...
✅ Universities: 2590 imported, 0 errors

🔗 Linking universities to conferences...
✅ University-Conference links: 2590 created

🔗 Linking universities to divisions...
✅ University-Division links: 2590 created

👤 Importing 6277 coaches...
✅ Coaches: 6277 imported, 0 errors

💼 Importing 5510 university jobs...
✅ University Jobs: 5510 imported, 0 skipped, 0 errors

✨ Import complete!
```

## 🔧 Data Cleaning

The script handles:

- **Empty values** - Converts `"-"`, `""`, `"N/A"` to `null`
- **Percentages** - Parses `"86.83%"` to `86.83`
- **Numbers** - Converts string numbers to floats/integers
- **Whitespace** - Trims all strings

## ⚠️ Important Notes

### Upsert Strategy

The script uses `upsert` with these conflict resolution strategies:

- **Universities**: `onConflict: "name"` - Assumes university names are unique
- **Coaches**: `onConflict: "full_name"` - Assumes coach names are unique
- **University Jobs**: `onConflict: "coach_id,university_id"` - Assumes one job per coach per university

> 🚨 **Database Constraints Required**: You may need to add unique constraints:
```sql
-- Add unique constraint on university name
ALTER TABLE universities ADD CONSTRAINT universities_name_key UNIQUE (name);

-- Add unique constraint on coach full_name
ALTER TABLE coaches ADD CONSTRAINT coaches_full_name_key UNIQUE (full_name);

-- Add unique constraint on university_jobs composite key
ALTER TABLE university_jobs ADD CONSTRAINT university_jobs_coach_university_key UNIQUE (coach_id, university_id);
```

### Duplicate Coach Names

If multiple coaches have the same name, you'll need to handle this:

1. Add a unique identifier field (e.g., `email` or `twitter_profile`)
2. Update the upsert logic to use that field
3. Modify the lookup strategy

### Missing Relationships

If a job references a coach or university not in the import sheets:
- The script will log a warning: `⚠️ Coach not found: John Doe`
- The job will be skipped
- Import continues for remaining records

## 🐛 Troubleshooting

### "Missing environment variables"
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check `.env` file in `apps/web/`

### "Cannot find module 'xlsx'"
```bash
bun add -D xlsx
```

### "duplicate key value violates unique constraint"
- Data has duplicates
- Check which records are duplicated
- Decide on upsert strategy or clean source data

### "foreign key constraint violation"
- Ensure universities are imported before coaches
- Ensure coaches are imported before university_jobs
- Script handles this automatically

## 📊 Post-Import Validation

Run these queries to verify the import:

```sql
-- Check record counts
SELECT 'universities' as table_name, COUNT(*) as count FROM universities
UNION ALL
SELECT 'coaches', COUNT(*) FROM coaches
UNION ALL
SELECT 'university_jobs', COUNT(*) FROM university_jobs;

-- Check for orphaned jobs (should be 0)
SELECT COUNT(*)
FROM university_jobs uj
WHERE NOT EXISTS (SELECT 1 FROM coaches c WHERE c.id = uj.coach_id)
   OR NOT EXISTS (SELECT 1 FROM universities u WHERE u.id = uj.university_id);

-- Sample data
SELECT
  c.full_name,
  u.name as university,
  uj.job_title,
  uj.work_email
FROM university_jobs uj
JOIN coaches c ON c.id = uj.coach_id
JOIN universities u ON u.id = uj.university_id
LIMIT 10;
```

## 🔄 Re-running the Import

The script is idempotent (safe to run multiple times):

- `upsert` will update existing records
- New records will be added
- No duplicates will be created (if constraints are in place)

## 📁 Files

- `Coach List.xlsx` - Source data file
- `import-coach-data.ts` - Main import script
- `inspect-excel.ts` - Utility to inspect Excel structure
- `README.md` - This file
