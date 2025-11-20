import type { Json } from "@/utils/supabase/database.types";

// TODO: Regenerate database types after running migration 20251114223442_create_coach_import_tables.sql
// Then replace these manual types with: Database["public"]["Tables"]["coach_import_jobs"]["Row"]
export interface CoachImportJob {
	id: string;
	uploaded_by: string | null;
	file_url: string | null;
	original_filename: string | null;
	file_size_bytes: number | null;
	status: string;
	total_rows: number | null;
	processed_rows: number | null;
	success_count: number | null;
	error_count: number | null;
	error_log: Json | null;
	started_at: string | null;
	completed_at: string | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface CoachImportJobInsert {
	id?: string;
	uploaded_by?: string | null;
	file_url?: string | null;
	original_filename?: string | null;
	file_size_bytes?: number | null;
	status?: string;
	total_rows?: number | null;
	processed_rows?: number | null;
	success_count?: number | null;
	error_count?: number | null;
	error_log?: Json | null;
	started_at?: string | null;
	completed_at?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
}

export interface CoachImportJobUpdate {
	id?: string;
	uploaded_by?: string | null;
	file_url?: string | null;
	original_filename?: string | null;
	file_size_bytes?: number | null;
	status?: string;
	total_rows?: number | null;
	processed_rows?: number | null;
	success_count?: number | null;
	error_count?: number | null;
	error_log?: Json | null;
	started_at?: string | null;
	completed_at?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
}

export type ImportStatus = "pending" | "processing" | "completed" | "failed";

export interface ImportErrorLog {
	row: number;
	error: string;
	uniqueId?: string;
	coachName?: string;
	school?: string;
}

export interface ImportJobWithUploader extends Omit<CoachImportJob, "error_log"> {
	error_log?: ImportErrorLog[] | null;
	uploader?: {
		id: string;
		first_name: string | null;
		last_name: string | null;
		email: string;
	} | null;
}
