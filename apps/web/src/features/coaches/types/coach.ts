import type { Enums, Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database types - Extended with university job info
export type CoachRow = Tables<"coaches"> & {
	university_jobs?:
		| {
				job_title: string | null;
				university_id: string | null;
				work_email: string | null;
				universities?: {
					name: string | null;
					state: string | null;
					institution_flags_raw: string | null;
					us_news_ranking_national_2018: number | null;
					us_news_ranking_liberal_arts_2018: number | null;
					university_conferences?:
						| {
								conferences: {
									name: string | null;
								} | null;
						  }[]
						| null;
				} | null;
		  }[]
		| null;
};

// Enums from database
export type EventGroup = Enums<"event_group_enum">;

// Constants for dropdowns
export const EVENT_GROUPS: EventGroup[] = [
	"sprints",
	"hurdles",
	"distance",
	"jumps",
	"throws",
	"relays",
	"combined",
];

export const EVENT_GROUP_LABELS: Record<EventGroup, string> = {
	sprints: "Sprints",
	hurdles: "Hurdles",
	distance: "Distance",
	jumps: "Jumps",
	throws: "Throws",
	relays: "Relays",
	combined: "Combined Events",
};

// Validation utilities
export const validationUtils = {
	// Name validation with proper formatting
	fullName: z
		.string()
		.min(2, "Must be at least 2 characters")
		.max(100, "Must be less than 100 characters")
		.regex(
			/^[a-zA-Z\s'-]+$/,
			"Only letters, spaces, hyphens, and apostrophes allowed",
		)
		.transform((val) => val.trim())
		.refine((val) => val.length > 0, "Cannot be empty after trimming"),

	// Email with better validation
	email: z
		.string()
		.email({ message: "Please enter a valid email address" })
		.max(100, "Email must be less than 100 characters")
		.toLowerCase()
		.transform((val) => val.trim())
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Phone validation with pattern matching
	phone: z
		.string()
		.regex(
			/^[\d\s()+-]+$/,
			"Only numbers, spaces, parentheses, plus, and hyphens allowed",
		)
		.min(10, "Phone number must be at least 10 characters")
		.max(20, "Phone number must be less than 20 characters")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Profile URL validation (social media)
	profileUrl: z
		.string()
		.max(500, "URL must be less than 500 characters")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Event group enum validation
	eventGroup: z
		.enum(
			[
				"sprints",
				"hurdles",
				"distance",
				"jumps",
				"throws",
				"relays",
				"combined",
			],
			{
				errorMap: () => ({ message: "Please select a valid specialty" }),
			},
		)
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Textarea with max length
	textarea: (maxLength = 1000) =>
		z
			.string()
			.max(maxLength, `Must be less than ${maxLength} characters`)
			.optional()
			.or(z.literal("").transform(() => undefined)),

	// UUID validation
	uuid: z
		.string()
		.uuid({ message: "Invalid ID format" })
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Date validation
	date: z
		.string()
		.optional()
		.or(z.literal("").transform(() => undefined)),
};

// Base coach schema for creation (matches database schema)
export const coachCreateSchema = z.object({
	// Identity
	full_name: validationUtils.fullName,
	primary_specialty: validationUtils.eventGroup,

	// Contact
	email: validationUtils.email,
	phone: validationUtils.phone,

	// Profiles
	twitter_profile: validationUtils.profileUrl,
	linkedin_profile: validationUtils.profileUrl,
	instagram_profile: validationUtils.profileUrl,

	// Internal
	internal_notes: validationUtils.textarea(5000),

	// University Job (optional nested object)
	university_job: z
		.object({
			university_id: validationUtils.uuid,
			program_id: validationUtils.uuid,
			job_title: z
				.string()
				.max(200, "Job title must be less than 200 characters")
				.optional()
				.or(z.literal("").transform(() => undefined)),
			work_email: validationUtils.email,
			work_phone: validationUtils.phone,
			start_date: validationUtils.date,
			internal_notes: validationUtils.textarea(5000),
		})
		.optional(),
});

// Schema for coach updates (all fields optional except id)
export const coachUpdateSchema = coachCreateSchema.partial().extend({
	id: z.string().uuid({ message: "Invalid ID format" }),
});

// Form schema for coach creation (used in forms) - more lenient for better UX
export const coachFormSchema = z.object({
	// Identity
	full_name: z.string().min(1, "Full name is required"),
	primary_specialty: z.string().optional().default(""),

	// Contact
	email: z.string().optional().default(""),
	phone: z.string().optional().default(""),

	// Profiles
	twitter_profile: z.string().optional().default(""),
	linkedin_profile: z.string().optional().default(""),
	instagram_profile: z.string().optional().default(""),

	// Internal
	internal_notes: z.string().optional().default(""),

	// University Job fields (optional)
	university_id: z.string().optional().default(""),
	program_id: z.string().optional().default(""),
	job_title: z.string().optional().default(""),
	work_email: z.string().optional().default(""),
	work_phone: z.string().optional().default(""),
	start_date: z.string().optional().default(""),
	job_internal_notes: z.string().optional().default(""),
});

// Form schema for coach updates
export const coachEditFormSchema = coachFormSchema.extend({
	id: z.string().uuid({ message: "Invalid ID format" }),
});

// Type exports for TypeScript
export type CoachCreateInput = z.infer<typeof coachCreateSchema>;
export type CoachUpdateInput = z.infer<typeof coachUpdateSchema>;
export type CoachFormInput = z.infer<typeof coachFormSchema>;
export type CoachEditFormInput = z.infer<typeof coachEditFormSchema>;

// Validation helper functions for forms
export const validateSingleField = <T>(
	value: T,
	schema: z.ZodSchema<T>,
): string | undefined => {
	try {
		schema.parse(value);
		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message || "Invalid input";
		}
		return "Invalid input";
	}
};

// Get field validation function for specific field
export const getFieldValidator = (fieldName: keyof CoachFormInput) => {
	const fieldSchemas: Record<string, z.ZodSchema> = {
		full_name: validationUtils.fullName,
		primary_specialty: validationUtils.eventGroup,
		email: validationUtils.email,
		phone: validationUtils.phone,
		twitter_profile: validationUtils.profileUrl,
		linkedin_profile: validationUtils.profileUrl,
		instagram_profile: validationUtils.profileUrl,
		internal_notes: validationUtils.textarea(5000),
	};

	return (value: any) => validateSingleField(value, fieldSchemas[fieldName]);
};

// Type guards for better TypeScript support
export const isCoachCreateInput = (data: unknown): data is CoachCreateInput => {
	return coachCreateSchema.safeParse(data).success;
};

export const isCoachUpdateInput = (data: unknown): data is CoachUpdateInput => {
	return coachUpdateSchema.safeParse(data).success;
};

export const isCoachFormInput = (data: unknown): data is CoachFormInput => {
	return coachFormSchema.safeParse(data).success;
};

// Custom error formatter for better UX
export const formatValidationError = (
	error: z.ZodError,
): Record<string, string[]> => {
	const errors: Record<string, string[]> = {};

	error.issues.forEach((issue) => {
		const field = issue.path.join(".");
		if (!errors[field]) {
			errors[field] = [];
		}
		errors[field].push(issue.message);
	});

	return errors;
};

// Extract all validation errors for toast display
export const getAllValidationErrors = (
	validationErrors: Record<string, any>,
): string[] => {
	const errors: string[] = [];

	// Handle global errors
	if (validationErrors._errors && Array.isArray(validationErrors._errors)) {
		errors.push(...validationErrors._errors);
	}

	// Handle field-specific errors
	Object.entries(validationErrors).forEach(([field, fieldErrors]) => {
		if (field !== "_errors" && fieldErrors) {
			if (Array.isArray(fieldErrors)) {
				const fieldName = field
					.replace(/_/g, " ")
					.replace(/\b\w/g, (l) => l.toUpperCase());
				errors.push(
					...fieldErrors.map((error: string) => `${fieldName}: ${error}`),
				);
			} else if (fieldErrors._errors && Array.isArray(fieldErrors._errors)) {
				const fieldName = field
					.replace(/_/g, " ")
					.replace(/\b\w/g, (l) => l.toUpperCase());
				errors.push(
					...fieldErrors._errors.map(
						(error: string) => `${fieldName}: ${error}`,
					),
				);
			}
		}
	});

	return errors;
};
