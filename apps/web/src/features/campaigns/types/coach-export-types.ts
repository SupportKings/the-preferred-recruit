import type { Json } from "@/utils/supabase/database.types";

import type {
	FiltersState,
	NumberFilterOperator,
	OptionFilterOperator,
} from "@/components/data-table-filter/core/types";

// Re-export for convenience
export type { FiltersState };

// Server-side filter format with operator support
export interface CoachExportServerFilters {
	divisions?: {
		values: string[];
		operator: OptionFilterOperator;
	};
	universities?: {
		values: string[];
		operator: OptionFilterOperator;
	};
	programs?: {
		values: string[];
		operator: OptionFilterOperator;
	};
	tuition?: {
		values: number[];
		operator: NumberFilterOperator;
	};
}

// TODO: Regenerate database types after running migration 20251116192221_create_coach_list_exports.sql
// Then replace these manual types with: Database["public"]["Tables"]["coach_list_exports"]["Row"]
export interface CoachListExport {
	id: string;
	campaign_id: string;
	exported_by: string;
	file_name: string;
	file_format: string;
	row_count: number;
	filters: Json | null;
	file_url: string | null;
	created_at: string | null;
	updated_at: string | null;
	is_deleted: boolean | null;
	deleted_at: string | null;
	deleted_by: string | null;
}

export interface CoachListExportInsert {
	id?: string;
	campaign_id: string;
	exported_by: string;
	file_name: string;
	file_format?: string;
	row_count?: number;
	filters?: Json | null;
	file_url?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	is_deleted?: boolean | null;
	deleted_at?: string | null;
	deleted_by?: string | null;
}

export interface CoachListExportUpdate {
	id?: string;
	campaign_id?: string;
	exported_by?: string;
	file_name?: string;
	file_format?: string;
	row_count?: number;
	filters?: Json | null;
	file_url?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	is_deleted?: boolean | null;
	deleted_at?: string | null;
	deleted_by?: string | null;
}

export interface CoachExportFilters {
	divisions?: string[];
	universities?: string[];
	programs?: string[];
	minTuition?: number;
	maxTuition?: number;
}

export interface CampaignCoachData {
	// Coach info
	coachId: string;
	coachName: string;
	coachEmail: string | null;
	coachPhone: string | null;
	coachTwitter: string | null;
	coachInstagram: string | null;
	coachLinkedIn: string | null;

	// University Job info
	universityJobId: string | null;
	jobTitle: string | null;
	workEmail: string | null;
	workPhone: string | null;
	startDate: string | null;
	endDate: string | null;

	// University info
	universityId: string | null;
	universityName: string | null;
	state: string | null;
	city: string | null;
	region: string | null;
	sizeOfCity: string | null;
	publicPrivate: string | null;
	religiousAffiliation: string | null;
	tuition: number | null;
	conferenceId: string | null;
	conferenceName: string | null;

	// University academic info
	averageGpa: number | null;
	satReading25th: number | null;
	satReading75th: number | null;
	satMath25th: number | null;
	satMath75th: number | null;
	actComposite25th: number | null;
	actComposite75th: number | null;
	acceptanceRate: number | null;
	undergraduateEnrollment: number | null;

	// Program info
	programId: string | null;
	programName: string | null;
	division: string | null;
	gender: string | null;

	// Campaign Lead info (if exists)
	campaignLeadId: string | null;
	leadStatus: string | null;
	includeReason: string | null;
	includedAt: string | null;
}

// Result type for coach selection modal - supports both individual selection and "select all" mode
export type CoachSelectionResult =
	| { selectAll: false; coaches: CampaignCoachData[] }
	| { selectAll: true; filters: CoachExportServerFilters; count: number };
