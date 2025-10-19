import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database types
export type UniversityJob = Tables<"university_jobs">;
export type CoachResponsibility = Tables<"coach_responsibilities">;
export type CampaignLead = Tables<"campaign_leads">;
export type Reply = Tables<"replies">;

// Extended types with relations
export type UniversityJobWithRelations = UniversityJob & {
	coaches: {
		id: string;
		full_name: string | null;
		email: string | null;
		primary_specialty: string | null;
	} | null;
	universities: {
		id: string;
		name: string | null;
		city: string | null;
		state: string | null;
	} | null;
	programs: {
		id: string;
		gender: string | null;
		team_url: string | null;
	} | null;
	coach_responsibilities: Array<
		CoachResponsibility & {
			events: {
				id: string;
				code: string | null;
				name: string | null;
				event_group: string | null;
			} | null;
		}
	>;
	campaign_leads: Array<
		CampaignLead & {
			campaigns: {
				id: string;
				name: string | null;
				type: string | null;
				status: string | null;
			} | null;
			universities: {
				id: string;
				name: string | null;
				city: string | null;
			} | null;
			programs: {
				id: string;
				gender: string | null;
			} | null;
		}
	>;
	replies: Array<
		Reply & {
			campaigns: {
				id: string;
				name: string | null;
				type: string | null;
			} | null;
			athlete_applications: {
				id: string;
				stage: string | null;
				last_interaction_at: string | null;
			} | null;
			athletes: {
				id: string;
				full_name: string;
				contact_email: string | null;
			} | null;
		}
	>;
};

// Update schema for university jobs
export const universityJobUpdateSchema = z.object({
	id: z.string().uuid(),
	coach_id: z.string().uuid().nullable().optional(),
	job_title: z.string().nullable().optional(),
	program_scope: z.enum(["men", "women", "both", "n/a"]).nullable().optional(),
	university_id: z.string().uuid().nullable().optional(),
	program_id: z.string().uuid().nullable().optional(),
	work_email: z.string().email().nullable().optional(),
	work_phone: z.string().nullable().optional(),
	start_date: z.string().nullable().optional(),
	end_date: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export type UniversityJobUpdate = z.infer<typeof universityJobUpdateSchema>;

// Coach responsibility schemas
export const coachResponsibilityCreateSchema = z.object({
	university_job_id: z.string().uuid(),
	event_group: z
		.enum([
			"sprints",
			"hurdles",
			"distance",
			"jumps",
			"throws",
			"relays",
			"combined",
		])
		.nullable()
		.optional(),
	event_id: z.string().uuid().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const coachResponsibilityUpdateSchema = z.object({
	id: z.string().uuid(),
	event_group: z
		.enum([
			"sprints",
			"hurdles",
			"distance",
			"jumps",
			"throws",
			"relays",
			"combined",
		])
		.nullable()
		.optional(),
	event_id: z.string().uuid().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export type CoachResponsibilityCreate = z.infer<
	typeof coachResponsibilityCreateSchema
>;
export type CoachResponsibilityUpdate = z.infer<
	typeof coachResponsibilityUpdateSchema
>;

// Campaign lead schemas
export const campaignLeadCreateSchema = z.object({
	university_job_id: z.string().uuid(),
	campaign_id: z.string().uuid().nullable().optional(),
	university_id: z.string().uuid().nullable().optional(),
	program_id: z.string().uuid().nullable().optional(),
	status: z.enum(["pending", "replied", "suppressed"]).nullable().optional(),
	include_reason: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const campaignLeadUpdateSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(["pending", "replied", "suppressed"]).nullable().optional(),
	include_reason: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
	program_id: z.string().uuid().nullable().optional(),
});

export type CampaignLeadCreate = z.infer<typeof campaignLeadCreateSchema>;
export type CampaignLeadUpdate = z.infer<typeof campaignLeadUpdateSchema>;

// Reply schemas
export const replyCreateSchema = z.object({
	university_job_id: z.string().uuid(),
	type: z.enum(["call", "text", "email", "instagram"]).nullable().optional(),
	occurred_at: z.string().nullable().optional(),
	summary: z.string().nullable().optional(),
	campaign_id: z.string().uuid().nullable().optional(),
	application_id: z.string().uuid().nullable().optional(),
	athlete_id: z.string().uuid().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const replyUpdateSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(["call", "text", "email", "instagram"]).nullable().optional(),
	occurred_at: z.string().nullable().optional(),
	summary: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export type ReplyCreate = z.infer<typeof replyCreateSchema>;
export type ReplyUpdate = z.infer<typeof replyUpdateSchema>;
