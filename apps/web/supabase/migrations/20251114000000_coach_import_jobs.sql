-- Coach Import Jobs Table
-- Tracks file uploads and processing status for coach data imports

create table public.coach_import_jobs (
	id uuid primary key default gen_random_uuid(),
	uploaded_by uuid references public.team_members(id) on delete set null,
	file_url text not null,
	original_filename text not null,
	file_size_bytes bigint,
	status text not null check (status in ('pending', 'processing', 'completed', 'failed')),
	total_rows integer default 0,
	processed_rows integer default 0,
 	error_log jsonb,
	started_at timestamptz,
	completed_at timestamptz,
	created_at timestamptz not null default current_timestamp,
	updated_at timestamptz not null default current_timestamp
);

-- Indexes for efficient querying
create index idx_coach_import_jobs_status on public.coach_import_jobs(status);
create index idx_coach_import_jobs_uploaded_by on public.coach_import_jobs(uploaded_by);
create index idx_coach_import_jobs_created_at on public.coach_import_jobs(created_at desc);

-- Enable RLS
alter table public.coach_import_jobs enable row level security;

-- Policies
-- Admin users can view all import jobs
create policy "Admins can view all import jobs"
	on public.coach_import_jobs for select
	using (
		exists (
			select 1 from public.team_members tm
			join public."user" u on tm.user_id = u.id
			where tm.id = uploaded_by
			and u.role = 'admin'
		)
	);

-- Users can only view their own import jobs
create policy "Users can view own import jobs"
	on public.coach_import_jobs for select
	using (
		exists (
			select 1 from public.team_members tm
			where tm.id = uploaded_by
			and tm.user_id = auth.uid()::text
		)
	);

-- Only authenticated users can create import jobs
create policy "Authenticated users can create import jobs"
	on public.coach_import_jobs for insert
	with check (
		exists (
			select 1 from public.team_members tm
			where tm.id = uploaded_by
			and tm.user_id = auth.uid()::text
		)
	);

-- System/service role can update job status (for Trigger.dev)
create policy "Service role can update import jobs"
	on public.coach_import_jobs for update
	using (true)
	with check (true);

-- Comment on table
comment on table public.coach_import_jobs is 'Tracks coach data import jobs from Excel files';