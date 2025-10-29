import type { Enums, Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database types
export type AthleteApplicationRow = Tables<"athlete_applications">;

// Enums from database
export type ApplicationStage = Enums<"application_stage_enum">;

// Constants for dropdowns
export const APPLICATION_STAGES: ApplicationStage[] = [
	"intro",
	"ongoing",
	"visit",
	"offer",
	"committed",
	"dropped",
];

// Display labels for stages
export const STAGE_LABELS: Record<ApplicationStage, string> = {
	intro: "Introduction",
	ongoing: "Ongoing",
	visit: "Visit Scheduled",
	offer: "Offer Received",
	committed: "Committed",
	dropped: "Dropped",
};

// Validation utilities
export const validationUtils = {
	// UUID validation
	uuid: z.string().uuid({ message: "Invalid ID format" }),

	// Optional UUID validation
	optionalUuid: z
		.string()
		.uuid({ message: "Invalid ID format" })
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Date validation for YYYY-MM-DD format
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Stage enum validation
	stage: z
		.enum(["intro", "ongoing", "visit", "offer", "committed", "dropped"], {
			errorMap: () => ({ message: "Please select a valid stage" }),
		})
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Number validation for scholarship amount
	scholarshipAmount: z
		.number({ invalid_type_error: "Must be a number" })
		.min(0, "Amount must be 0 or higher")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Number validation for scholarship percent
	scholarshipPercent: z
		.number({ invalid_type_error: "Must be a number" })
		.min(0, "Percentage must be 0 or higher")
		.max(100, "Percentage must be 100 or lower")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Text field with max length
	text: (maxLength = 500) =>
		z
			.string()
			.max(maxLength, `Must be less than ${maxLength} characters`)
			.optional()
			.or(z.literal("").transform(() => undefined)),
};

// Create Schema - for server action (strict validation)
export const athleteApplicationCreateSchema = z.object({
	athlete_id: validationUtils.optionalUuid,
	university_id: validationUtils.optionalUuid,
	program_id: validationUtils.optionalUuid,
	stage: validationUtils.stage,
	start_date: validationUtils.date,
	offer_date: validationUtils.date,
	commitment_date: validationUtils.date,
	last_interaction_at: validationUtils.date,
	scholarship_amount_per_year: validationUtils.scholarshipAmount,
	scholarship_percent: validationUtils.scholarshipPercent,
	offer_notes: validationUtils.text(1000),
	internal_notes: validationUtils.text(1000),
});

// Update Schema - with ID required
export const athleteApplicationUpdateSchema =
	athleteApplicationCreateSchema.extend({
		id: validationUtils.uuid,
	});

// Form Schema - form-friendly with string inputs that transform to correct types
export const athleteApplicationFormSchema = z.object({
	athlete_id: z.string().optional().or(z.literal("")),
	university_id: z.string().optional().or(z.literal("")),
	program_id: z.string().optional().or(z.literal("")),
	stage: z.string().optional().or(z.literal("")),
	start_date: z.string().optional().or(z.literal("")),
	offer_date: z.string().optional().or(z.literal("")),
	commitment_date: z.string().optional().or(z.literal("")),
	last_interaction_at: z.string().optional().or(z.literal("")),
	scholarship_amount_per_year: z.string().optional().or(z.literal("")),
	scholarship_percent: z.string().optional().or(z.literal("")),
	offer_notes: z.string().optional().or(z.literal("")),
	internal_notes: z.string().optional().or(z.literal("")),
});

// Edit Form Schema - extending form schema with ID
export const athleteApplicationEditFormSchema =
	athleteApplicationFormSchema.extend({
		id: z.string(),
	});

// TypeScript types
export type AthleteApplicationCreateData = z.infer<
	typeof athleteApplicationCreateSchema
>;
export type AthleteApplicationUpdateData = z.infer<
	typeof athleteApplicationUpdateSchema
>;
export type AthleteApplicationFormData = z.infer<
	typeof athleteApplicationFormSchema
>;
export type AthleteApplicationEditFormData = z.infer<
	typeof athleteApplicationEditFormSchema
>;

// Extended type with relations
export interface AthleteApplicationWithRelations
	extends Tables<"athlete_applications"> {
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
		university_id: string | null;
	} | null;
}

// Validation helper functions
export function validateSingleField(
	field: keyof AthleteApplicationFormData,
	value: string | number | undefined,
): string | null {
	try {
		const fieldSchema = athleteApplicationCreateSchema.shape[field];
		if (fieldSchema) {
			fieldSchema.parse(value);
		}
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.errors[0]?.message || "Invalid value";
		}
		return "Validation error";
	}
}

export function getAllValidationErrors(
	errors: Record<string, { _errors: string[] }>,
): string[] {
	const messages: string[] = [];
	for (const [field, error] of Object.entries(errors)) {
		if (error._errors && error._errors.length > 0) {
			const fieldName = field
				.replace(/_/g, " ")
				.replace(/\b\w/g, (c) => c.toUpperCase());
			messages.push(`${fieldName}: ${error._errors.join(", ")}`);
		}
	}
	return messages;
}
