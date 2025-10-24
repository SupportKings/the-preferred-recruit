# Quick Start Guide - Coach Data Import

## 🎯 Overview

Import 6,277 coaches, 2,590 universities, and 5,510 job relationships from "Coach List.xlsx" into your database.

## ⚡ Quick Steps

### 1. Set Environment Variables
Add to `apps/web/.env`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Add Database Constraints (Optional but Recommended)
```bash
# Run in Supabase SQL Editor
cat apps/web/data-import/add-unique-constraints.sql
# Copy and paste into Supabase SQL Editor and run
```

### 3. Run Import
```bash
bun --env-file=apps/web/.env apps/web/data-import/import-coach-data.ts
```

### 4. Validate Results
```bash
bun --env-file=apps/web/.env apps/web/data-import/validate-import.ts
```

## 📊 What Gets Imported

**Note**: The script automatically cleans existing import data before importing fresh data.

| Table | Records | From Sheet |
|-------|---------|------------|
| governing_bodies | ~5 | Upload - Unversities (extracted) |
| conferences | ~154 | Upload - Unversities (extracted) |
| divisions | ~3 | Upload - Unversities (extracted) |
| universities | ~1,257 | Upload - Unversities |
| university_conferences | ~1,257 | Upload - Unversities (join) |
| university_divisions | ~914 | Upload - Unversities (join) |
| coaches | ~6,276 | Upload - coaches |
| university_jobs | ~5,499 | Upload - University Jobs (10 skipped) |

## ⏱️ Expected Duration

- Import: ~2-5 minutes (depends on network speed)
- Validation: ~30 seconds

## ✅ Success Indicators

After running, you should see:
```
✅ Governing Bodies: 3 imported
✅ Conferences: 300 imported
✅ Divisions: 10 imported
✅ Universities: 2590 imported, 0 errors
✅ University-Conference links: 2590 created
✅ University-Division links: 2590 created
✅ Coaches: 6277 imported, 0 errors
✅ University Jobs: 5510 imported, 0 skipped, 0 errors
✨ Import complete!
```

## ⚠️ Common Issues

### "Missing environment variables"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `apps/web/.env`

### "duplicate key value violates unique constraint"
**Fix:** Data has duplicates. Options:
1. Run `add-unique-constraints.sql` to enable upserts
2. Clean source data manually
3. Modify script to skip duplicates

### "foreign key constraint violation"
**Fix:** Script imports in wrong order. This shouldn't happen, but if it does:
- Ensure script runs universities → coaches → jobs in that order

## 📚 Full Documentation

- [README.md](./README.md) - Complete documentation
- [IMPORT-ANALYSIS.md](./IMPORT-ANALYSIS.md) - Detailed data analysis
- [add-unique-constraints.sql](./add-unique-constraints.sql) - Database constraints
- [import-coach-data.ts](./import-coach-data.ts) - Import script
- [validate-import.ts](./validate-import.ts) - Validation script

## 🆘 Need Help?

1. Check [README.md](./README.md) for troubleshooting
2. Run validation script to identify specific issues
3. Check Supabase logs for detailed errors
