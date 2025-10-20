import type { Tables } from "@/utils/supabase/database.types";

export type BallKnowledge = Tables<"ball_knowledge">;

export type BallKnowledgeWithRelations = {
	id: string;
	note: string;
	source_type: string | null;
	review_after: string | null;
	internal_notes: string | null;
	created_at: string | null;
	updated_at: string | null;
	from_athlete_id: string | null;
	about_coach_id: string | null;
	about_coach_name: string | null;
	about_university_id: string | null;
	about_university_name: string | null;
	about_program_id: string | null;
	about_program_gender: string | null;
	relation_type: string;
	total_count: number;
};

export type BallKnowledgeEntityType = "coach" | "university" | "program";
