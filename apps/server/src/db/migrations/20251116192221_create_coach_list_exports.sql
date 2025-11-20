-- Create coach_list_exports table for tracking campaign coach exports
CREATE TABLE IF NOT EXISTS coach_list_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  exported_by UUID NOT NULL REFERENCES team_members(id) ON DELETE SET NULL,

  -- Export metadata
  file_name TEXT NOT NULL,
  file_format TEXT NOT NULL DEFAULT 'csv',
  row_count INTEGER NOT NULL DEFAULT 0,

  -- Applied filters (stored as JSONB for flexibility)
  filters JSONB,

  -- File storage
  file_url TEXT,  -- URL to the exported file in storage

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES team_members(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_list_exports_campaign_id ON coach_list_exports(campaign_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_coach_list_exports_created_at ON coach_list_exports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_list_exports_exported_by ON coach_list_exports(exported_by);

-- Enable RLS
ALTER TABLE coach_list_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view coach list exports for their organization"
  ON coach_list_exports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = coach_list_exports.campaign_id
      AND is_deleted = FALSE
    )
  );

CREATE POLICY "Users can create coach list exports"
  ON coach_list_exports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = coach_list_exports.campaign_id
    )
  );

CREATE POLICY "Users can update their own coach list exports"
  ON coach_list_exports
  FOR UPDATE
  USING (exported_by = auth.uid());

CREATE POLICY "Users can delete their own coach list exports"
  ON coach_list_exports
  FOR DELETE
  USING (exported_by = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_coach_list_exports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_list_exports_updated_at
  BEFORE UPDATE ON coach_list_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_list_exports_updated_at();
