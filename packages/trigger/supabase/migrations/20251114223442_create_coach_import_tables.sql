-- Coach import job tracker table
CREATE TABLE IF NOT EXISTS coach_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  file_url TEXT,
  original_filename TEXT,
  file_size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_log JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_coach_import_jobs_status ON coach_import_jobs(status);

-- Index for created_at for sorting recent jobs
CREATE INDEX IF NOT EXISTS idx_coach_import_jobs_created_at ON coach_import_jobs(created_at DESC);

-- Index for uploaded_by
CREATE INDEX IF NOT EXISTS idx_coach_import_jobs_uploaded_by ON coach_import_jobs(uploaded_by);
