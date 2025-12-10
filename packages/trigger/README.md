# Trigger.dev Coach Import Package

Background job processing for coach data imports using Trigger.dev v4.

## What It Does

Processes Excel files uploaded via the web app to import coach data into the database:

1. **Downloads** Excel file from Supabase signed URL
2. **Parses** multi-tab Excel files (DI, DII, DIII, JuCo, NAIA)
3. **Filters** invalid rows (removed coaches, missing data)
4. **Deduplicates** by vendor unique_id
5. **Upserts** to database:
   - Universities (with full academic data)
   - Programs (Men's Track)
   - Coaches (with social media)
   - University Jobs (employment records)
   - Coach Responsibilities (event specialties)
   - Divisions & Conferences (linking)
6. **Tracks** progress in `coach_import_jobs` table

## Setup

### 1. Install Dependencies

```bash
cd packages/trigger
bun install
```

### 2. Configure Environment Variables

Create `/packages/trigger/.env`:

```bash
# Trigger.dev
TRIGGER_PROJECT_ID=proj_xxxxx
TRIGGER_SECRET_KEY=sk_xxxxx

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

Get these values:
- **Trigger.dev**: Sign up at https://trigger.dev and create a project
- **Database**: From Supabase project settings → Database → Connection string
- **Supabase**: From Supabase project settings → API

### 3. Run Database Migrations

The web app migrations include the `coach_import_jobs` table. Run if not already done:

```bash
cd apps/web
npx supabase db push
```

### 4. Create Supabase Storage Bucket

In Supabase Dashboard → Storage:
- Create bucket: `coach-imports`
- Make it **Private** (not public)
- The RLS policies are already defined in migrations

## Local Development

### Terminal 1: Run All Apps
```bash
bun dev
```

### Terminal 2: Run Trigger.dev Dev Server
```bash
bun trigger:dev
# Or directly:
cd packages/trigger
npx trigger.dev dev
```

This starts the Trigger.dev dev server which:
- Watches for file changes
- Processes jobs locally
- Shows real-time logs

### Test the Import

1. Navigate to http://localhost:3001/dashboard/coach-imports
2. Upload the example file: `Men's Track and Field Database July 2025.xlsx`
3. Monitor progress in:
   - Trigger.dev dashboard (http://localhost:3030)
   - Database: `SELECT * FROM coach_import_jobs`
   - Server logs

## Deployment

### 1. Deploy Trigger.dev Tasks

```bash
cd packages/trigger
npx trigger.dev deploy --skip-promotion
```

This creates a new version but doesn't activate it yet.

### 2. Deploy Web App

```bash
# Deploy to Vercel or your platform
vercel deploy
```

### 3. Promote Trigger.dev Version

```bash
cd packages/trigger
npx trigger.dev promote
```

Now the new version is live!

## Architecture

```
Web App (Next.js)
    ↓ uploads file
Supabase Storage (coach-imports bucket)
    ↓ creates job record
coach_import_jobs table (status: pending)
    ↓ triggers
Trigger.dev Task (process-coach-import)
    ↓ processes
Excel Parser → Data Mapper → Database Upserts
    ↓ updates
coach_import_jobs table (status: completed)
```

## File Structure

```
/packages/trigger/
├── src/
│   ├── index.ts                  # Export all tasks
│   ├── tasks/
│   │   └── coach-import.ts       # Main import task
│   └── lib/
│       ├── database.ts           # Supabase client
│       ├── excel-parser.ts       # Parse Excel files
│       ├── data-mapper.ts        # Map data to DB schema
│       ├── helpers.ts            # Utility functions
│       └── database.types.ts     # Generated Supabase types
├── trigger.config.ts             # Trigger.dev configuration
├── package.json
├── tsconfig.json
└── .env.example
```

## Excel File Format

Expected structure:
- **Headers**: Row 6
- **Data**: Starts at row 7
- **Sheets**: DI, DII, DIII, JuCo, NAIA (+ optional Tutorial)
- **Columns**: 41 columns including:
  - Coach: Unique ID, First name, Last name, Email, Phone, Position
  - University: School, City, State, Division, Conference, etc.
  - Program: Landing pages, Team's Twitter, Team's Instagram
  - Tracking: Removed? (y), Added?, Hire date, Responsibilities

## Data Mapping

| Excel Column | Database Table | Field |
|---|---|---|
| Unique ID | coaches | unique_id |
| First name + Last name | coaches | full_name |
| Email address | coaches | email |
| School | universities | name |
| Division | divisions | name (linked) |
| Conference | conferences | name (linked) |
| Position | university_jobs | job_title |
| Landing pages | programs | team_url |
| Team's Twitter | programs | team_twitter |
| Responsibilities | coach_responsibilities | event_group |

See [data-mapper.ts](src/lib/data-mapper.ts) for complete mapping.

## Troubleshooting

### Job Stuck in "Pending"

- Check Trigger.dev dev server is running
- Verify environment variables are set
- Check Trigger.dev dashboard for errors

### Job Failed

- Check `error_log` column in `coach_import_jobs` table
- Review Trigger.dev logs
- Common issues:
  - Invalid file format
  - Missing database connections
  - Duplicate unique_ids
  - Missing universities/conferences

### Can't Download File

- Verify signed URL hasn't expired (24 hours)
- Check Supabase storage bucket exists
- Verify service role key has storage access

## Monitoring

### Database

```sql
-- View all import jobs
SELECT
  id,
  original_filename,
  status,
  total_rows,
  success_count,
  error_count,
  created_at
FROM coach_import_jobs
ORDER BY created_at DESC;

-- View failed jobs
SELECT * FROM coach_import_jobs WHERE status = 'failed';

-- View error logs
SELECT id, original_filename, error_log
FROM coach_import_jobs
WHERE error_count > 0;
```

### Trigger.dev Dashboard

https://cloud.trigger.dev
- View job execution history
- Monitor performance metrics
- Debug failed runs
- View logs and payloads

## Support

- Trigger.dev Docs: https://trigger.dev/docs
- Supabase Docs: https://supabase.com/docs
- Project Issues: https://github.com/your-org/your-repo/issues
