# Coach List Import Analysis

## 📊 Data Overview

### Excel File Structure
The "Coach List.xlsx" file contains 4 sheets:

| Sheet Name | Rows | Purpose |
|------------|------|---------|
| OG Data Combined | 5,917 | Original combined data (NOT USED) |
| Upload - Unversities | 2,590 | University information for import |
| Upload - coaches | 6,277 | Coach profiles for import |
| Upload - University Jobs | 5,510 | Coach-University job relationships |

## 🗺️ Data Mapping

### 1. Universities Sheet → `universities` Table

**CSV Columns:**
```
name, state, city, region, conference, divison, governing body,
ipeds_nces_id, religious_affiliation, average_gpa,
us_news_ranking_national_2018, us_news_ranking_liberal_arts_2018,
majors_offered_url, sat_ebrw_25th, sat_ebrw_75th, sat_math_25th,
sat_math_75th, act_composite_25th, act_composite_75th, acceptance_rate_pct
```

**Database Schema Match:**
- ✅ Direct mapping for most fields
- ⚠️ `divison` (typo in CSV) → `division_raw`
- ⚠️ `acceptance_rate_pct` comes as "86.83%" → needs parsing to 86.83
- ⚠️ `governing body` → stored in `conference_raw` or separate table

**Sample Data:**
```
Alabama A&M University
- State: Alabama
- City: Huntsville
- Conference: Southwestern Athletic Conference (SWAC)
- Division: D1
- GPA: 3.03
- SAT EBRW: 430-520
- SAT Math: 410-500
- ACT: 15-20
- Acceptance Rate: 86.83%
```

### 2. Coaches Sheet → `coaches` Table

**CSV Columns:**
```
full_name, twitter_profile, linkedin_profile, instagram_profile, primary_specialty
```

**Database Schema Match:**
- ✅ Direct mapping for all social profiles
- ⚠️ `primary_specialty` → maps to `event_group_enum` (may need validation)
- ⚠️ Empty values represented as "-" need to be converted to null

**Sample Data:**
```
Andrew Murphy
- Twitter: https://twitter.com/coachmurphy1867
- LinkedIn: (empty)
- Instagram: -
- Primary Specialty: (empty)
```

**Data Quality Issues:**
- Many coaches have "-" or empty values for social profiles
- Primary specialty field is mostly empty in sample data
- Full names may not be unique (potential duplicates)

### 3. University Jobs Sheet → `university_jobs` Table

**CSV Columns:**
```
coach_id, university_id, job_title, work_email, work_phone
```

**Mapping Challenge:**
- `coach_id` contains **coach name**, not ID
- `university_id` contains **university name**, not ID
- Requires lookup to resolve names → IDs

**Database Schema:**
```typescript
{
  coach_id: string (FK to coaches.id)
  university_id: string (FK to universities.id)
  job_title: string
  work_email: string
  work_phone: string
  program_id: string | null  // Not in CSV
  start_date: string | null   // Not in CSV
  end_date: string | null     // Not in CSV
}
```

**Sample Data:**
```
Andrew Murphy @ Alabama A&M University
- Job Title: Head Coach
- Email: (empty)
- Phone: 256-372-4013
```

## 🔗 Relationships & Foreign Keys

```
universities (2,590 records)
    ↓
    └─> university_jobs (5,510 records)
            ├─> coaches (6,277 records)
            └─> programs (0 records in import)
```

### Import Order (Critical!)
1. **Universities first** - No dependencies
2. **Coaches second** - No dependencies
3. **University Jobs last** - Depends on both universities and coaches

## ⚠️ Potential Issues

### 1. Duplicate Names
**Universities:**
- Assuming university names are unique
- If duplicates exist, may need to use `ipeds_nces_id` as unique key

**Coaches:**
- Full names may not be unique (e.g., multiple "John Smith")
- Consider adding email as unique identifier
- Current data shows many coaches without emails

### 2. Missing Fields
**University Jobs:**
- `program_id` - Not in CSV (will be null)
- `start_date` / `end_date` - Not in CSV (will be null)
- These may need to be filled manually later

### 3. Data Quality
**Clean/Missing Values:**
- Many fields contain "-" which should be null
- Email fields often empty
- Phone numbers have inconsistent formats

**Percentage Parsing:**
- Acceptance rates like "86.83%" need conversion
- Some may be missing or in different formats

### 4. Enum Validation
**event_group_enum:**
- `primary_specialty` in coaches table must match enum values
- Current data shows this field is mostly empty
- May need to skip or map values

## 🎯 Recommended Import Strategy

### Option 1: Batch Import (Implemented)
```typescript
// Import in batches of 100 to avoid timeout
// Use upsert to handle duplicates
// Build lookup maps for name → id resolution
```

**Pros:**
- Fast for large datasets
- Handles existing data gracefully
- Automatically resolves relationships

**Cons:**
- Requires unique constraints
- May skip records with conflicts
- Less control over individual errors

### Option 2: Row-by-Row Import
```typescript
// Import one record at a time
// Better error handling per record
// Can log specific failures
```

**Pros:**
- Detailed error logging
- Can handle partial failures
- Better for data quality issues

**Cons:**
- Very slow for 6,000+ records
- More API calls
- Higher chance of rate limiting

### Recommendation: **Option 1** (Batch Import)
- Faster for bulk data
- More reliable with proper constraints
- Can be re-run safely

## 🔍 Data Validation Queries

After import, run these to verify:

```sql
-- 1. Count imported records
SELECT
  (SELECT COUNT(*) FROM universities) as universities,
  (SELECT COUNT(*) FROM coaches) as coaches,
  (SELECT COUNT(*) FROM university_jobs) as jobs;

-- 2. Find coaches without jobs
SELECT c.full_name, c.email
FROM coaches c
LEFT JOIN university_jobs uj ON uj.coach_id = c.id
WHERE uj.id IS NULL;

-- 3. Find universities without coaches
SELECT u.name, u.state
FROM universities u
LEFT JOIN university_jobs uj ON uj.university_id = u.id
WHERE uj.id IS NULL;

-- 4. Check for duplicate coach names
SELECT full_name, COUNT(*)
FROM coaches
GROUP BY full_name
HAVING COUNT(*) > 1;

-- 5. Verify relationships
SELECT
  c.full_name,
  u.name as university,
  uj.job_title,
  uj.work_email,
  uj.work_phone
FROM university_jobs uj
JOIN coaches c ON c.id = uj.coach_id
JOIN universities u ON u.id = uj.university_id
ORDER BY u.name, c.full_name
LIMIT 100;
```

## 📋 Pre-Import Checklist

- [ ] Add unique constraints (run `add-unique-constraints.sql`)
- [ ] Set environment variables (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Backup existing data (if any)
- [ ] Test import with small batch first
- [ ] Review data quality issues
- [ ] Plan for handling duplicates

## 🚀 Import Steps

1. **Prepare Database**
   ```bash
   # Run SQL to add constraints
   psql < apps/web/data-import/add-unique-constraints.sql
   ```

2. **Run Import**
   ```bash
   bun apps/web/data-import/import-coach-data.ts
   ```

3. **Validate Results**
   ```bash
   # Run validation queries in Supabase SQL editor
   ```

4. **Manual Cleanup** (if needed)
   - Resolve duplicate coaches
   - Add missing program_id values
   - Normalize phone numbers
   - Fill in start_date/end_date if available

## 📈 Expected Results

After successful import:

- **2,590 universities** with complete academic information
- **6,277 coaches** with social profiles
- **5,510 coach-university job relationships**
- **Zero orphaned records** (all FKs resolved)

## 🛠️ Next Steps After Import

1. **Create Programs** - Link university_jobs to specific programs (Men's/Women's teams)
2. **Normalize Data** - Clean phone numbers, standardize URLs
3. **Add Governing Bodies** - Extract from conference_raw to separate table
4. **Validate Enums** - Map primary_specialty to event_group_enum
5. **Fill Missing Data** - Collect emails, start dates, etc.
6. **Deduplication** - Resolve any duplicate coach names
