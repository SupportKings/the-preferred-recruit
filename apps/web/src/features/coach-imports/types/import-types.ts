import type { Database } from "@/utils/supabase/database.types";

export type CoachImportJob = Database["public"]["Tables"]["coach_import_jobs"]["Row"];
export type CoachImportJobInsert = Database["public"]["Tables"]["coach_import_jobs"]["Insert"];
export type CoachImportJobUpdate = Database["public"]["Tables"]["coach_import_jobs"]["Update"];

export type ImportStatus = "pending" | "processing" | "completed" | "failed";

export interface ImportJobWithUploader extends CoachImportJob {
	uploader?: {
		id: string;
		first_name: string | null;
		last_name: string | null;
		email: string;
	} | null;
}

export interface ImportErrorLog {
	row?: number;
	error: string;
	details?: string;
}
