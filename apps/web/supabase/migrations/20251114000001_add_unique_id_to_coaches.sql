-- Add unique_id column to coaches table
-- This will store the vendor's unique identifier for tracking updates across imports

alter table public.coaches add column unique_id text;

-- Create unique index (only for non-null values to allow coaches without vendor IDs)
create unique index idx_coaches_unique_id on public.coaches(unique_id) where unique_id is not null;

-- Comment on column
comment on column public.coaches.unique_id is 'Vendor-provided unique identifier for tracking coach across imports';