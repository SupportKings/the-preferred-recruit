import type { Tables } from "@/utils/supabase/database.types";

export interface Application extends Tables<"athlete_applications"> {
	athlete?: {
		id: string;
		full_name: string;
		graduation_year: number | null;
	} | null;
	university?: {
		id: string;
		name: string | null;
		state: string | null;
	} | null;
	program?: {
		id: string;
		gender: "men" | "women" | null;
		team_url: string | null;
	} | null;
}
