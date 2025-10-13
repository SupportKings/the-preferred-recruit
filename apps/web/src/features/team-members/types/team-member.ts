import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database types
export type TeamMemberRow = Tables<"team_members">;

// US Timezone options (comprehensive list including all US states and territories)
export const US_TIMEZONES = [
	// Continental US - Eastern Time Zone
	{ value: "America/New_York", label: "Eastern Time (America/New_York)" },

	// Continental US - Central Time Zone
	{ value: "America/Chicago", label: "Central Time (America/Chicago)" },

	// Continental US - Mountain Time Zone
	{ value: "America/Denver", label: "Mountain Time (America/Denver)" },
	{ value: "America/Phoenix", label: "Arizona - No DST (America/Phoenix)" },

	// Continental US - Pacific Time Zone
	{ value: "America/Los_Angeles", label: "Pacific Time (America/Los_Angeles)" },

	// Alaska
	{ value: "America/Anchorage", label: "Alaska Time (America/Anchorage)" },
	{ value: "America/Juneau", label: "Alaska - Juneau (America/Juneau)" },
	{ value: "America/Nome", label: "Alaska - Nome (America/Nome)" },
	{ value: "America/Sitka", label: "Alaska - Sitka (America/Sitka)" },
	{ value: "America/Yakutat", label: "Alaska - Yakutat (America/Yakutat)" },

	// Hawaii
	{
		value: "Pacific/Honolulu",
		label: "Hawaii-Aleutian Time (Pacific/Honolulu)",
	},

	// US Territories - Atlantic
	{
		value: "America/Puerto_Rico",
		label: "Atlantic Time - Puerto Rico (America/Puerto_Rico)",
	},
	{
		value: "America/St_Thomas",
		label: "Atlantic Time - US Virgin Islands (America/St_Thomas)",
	},

	// US Territories - Pacific
	{ value: "Pacific/Guam", label: "Chamorro Time - Guam (Pacific/Guam)" },
	{
		value: "Pacific/Saipan",
		label: "Chamorro Time - Northern Mariana Islands (Pacific/Saipan)",
	},
	{
		value: "Pacific/Pago_Pago",
		label: "Samoa Time - American Samoa (Pacific/Pago_Pago)",
	},
] as const;

// Validation utilities
export const validationUtils = {
	// Name validation with proper formatting
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Must be less than 100 characters")
		.transform((val) => val.trim())
		.refine((val) => val.length > 0, "Cannot be empty after trimming"),

	// Job title validation
	jobTitle: z
		.string()
		.min(1, "Job title is required")
		.max(100, "Must be less than 100 characters")
		.transform((val) => val.trim())
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Timezone validation
	timezone: z
		.string()
		.min(1, "Timezone is required")
		.max(100, "Must be less than 100 characters")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Textarea with max length
	textarea: (maxLength = 1000) =>
		z
			.string()
			.max(maxLength, `Must be less than ${maxLength} characters`)
			.optional()
			.or(z.literal("").transform(() => undefined)),
};

// Base team member schema for creation (matches database schema)
export const teamMemberCreateSchema = z.object({
	// Identity fields - combining first_name and last_name into name for form
	first_name: validationUtils.name,
	last_name: validationUtils.name,

	// Job information
	job_title: validationUtils.jobTitle,

	// Timezone
	timezone: validationUtils.timezone,

	// Internal notes
	internal_notes: validationUtils.textarea(5000),
});

// Schema for team member updates (all fields optional except id)
export const teamMemberUpdateSchema = teamMemberCreateSchema.partial().extend({
	id: z.string().uuid({ message: "Invalid ID format" }),
});

// Form schema for team member creation (used in forms) - more lenient for better UX
// Uses single 'name' field that will be split into first_name/last_name on submit
export const teamMemberFormSchema = z.object({
	// Single name field for better UX (will be split on submit)
	name: validationUtils.name,

	// Job information
	job_title: z.string().optional().default(""),

	// Timezone
	timezone: z.string().optional().default(""),

	// Internal notes
	internal_notes: z.string().optional().default(""),
});

// Form schema for team member updates
export const teamMemberEditFormSchema = teamMemberFormSchema.extend({
	id: z.string().uuid({ message: "Invalid ID format" }),
});

// Type exports for TypeScript
export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
export type TeamMemberFormInput = z.infer<typeof teamMemberFormSchema>;
export type TeamMemberEditFormInput = z.infer<typeof teamMemberEditFormSchema>;

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
export const getFieldValidator = (fieldName: keyof TeamMemberFormInput) => {
	const fieldSchemas: Record<string, z.ZodSchema> = {
		name: validationUtils.name,
		job_title: validationUtils.jobTitle,
		timezone: validationUtils.timezone,
		internal_notes: validationUtils.textarea(5000),
	};

	return (value: any) => validateSingleField(value, fieldSchemas[fieldName]);
};

// Type guards for better TypeScript support
export const isTeamMemberCreateInput = (
	data: unknown,
): data is TeamMemberCreateInput => {
	return teamMemberCreateSchema.safeParse(data).success;
};

export const isTeamMemberUpdateInput = (
	data: unknown,
): data is TeamMemberUpdateInput => {
	return teamMemberUpdateSchema.safeParse(data).success;
};

export const isTeamMemberFormInput = (
	data: unknown,
): data is TeamMemberFormInput => {
	return teamMemberFormSchema.safeParse(data).success;
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

// Helper function to split full name into first and last name
export const splitFullName = (
	fullName: string,
): { first_name: string; last_name: string } => {
	const trimmed = fullName.trim();
	const parts = trimmed.split(/\s+/);

	if (parts.length === 1) {
		return { first_name: parts[0], last_name: "" };
	}

	const first_name = parts[0];
	const last_name = parts.slice(1).join(" ");

	return { first_name, last_name };
};
