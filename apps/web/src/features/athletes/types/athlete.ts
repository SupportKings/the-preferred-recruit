import type { Database, Enums, Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database types
export type AthleteRow = Tables<"athletes">;
export type TeamMemberRow = Tables<"team_members">;

// Enums from database
export type AthleteGender = Enums<"athlete_gender_enum">;
export type PaymentType = Enums<"payment_type_enum">;
export type StudentType = Enums<"student_type_enum">;

// Constants for dropdowns
export const ATHLETE_GENDERS: AthleteGender[] = ["male", "female"];
export const PAYMENT_TYPES: PaymentType[] = [
	"paid_in_full",
	"installments",
	"deposit",
	"other",
];
export const STUDENT_TYPES: StudentType[] = [
	"high_school",
	"transfer",
	"international",
	"gap_year",
	"other",
];

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

	// Instagram handle validation
	instagramHandle: z
		.string()
		.regex(/^@?[\w.]+$/, "Invalid Instagram handle format")
		.max(30, "Instagram handle must be less than 30 characters")
		.transform((val) => (val.startsWith("@") ? val : `@${val}`))
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Gender enum validation
	gender: z
		.enum(["male", "female"], {
			errorMap: () => ({ message: "Please select a valid gender" }),
		})
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Date validation for YYYY-MM-DD format
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// URL validation
	url: z
		.string()
		.url({ message: "Please enter a valid URL" })
		.max(500, "URL must be less than 500 characters")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Text field with max length
	text: (maxLength = 100) =>
		z
			.string()
			.max(maxLength, `Must be less than ${maxLength} characters`)
			.optional()
			.or(z.literal("").transform(() => undefined)),

	// Number validation for graduation year
	graduationYear: z
		.number({ invalid_type_error: "Must be a number" })
		.int("Must be a whole number")
		.min(2000, "Year must be 2000 or later")
		.max(2050, "Year must be 2050 or earlier")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Number validation for GPA
	gpa: z
		.number({ invalid_type_error: "Must be a number" })
		.min(0, "GPA must be 0.0 or higher")
		.max(5, "GPA must be 5.0 or lower")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Number validation for test scores
	testScore: (min: number, max: number) =>
		z
			.number({ invalid_type_error: "Must be a number" })
			.int("Must be a whole number")
			.min(min, `Score must be ${min} or higher`)
			.max(max, `Score must be ${max} or lower`)
			.optional()
			.or(z.literal("").transform(() => undefined)),

	// Number validation for currency (USD)
	currency: z
		.number({ invalid_type_error: "Must be a number" })
		.min(0, "Amount must be 0 or higher")
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// UUID validation
	uuid: z.string().uuid({ message: "Invalid ID format" }),

	// Optional UUID validation
	optionalUuid: z
		.string()
		.uuid({ message: "Invalid ID format" })
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Payment type enum validation
	paymentType: z
		.enum(["paid_in_full", "installments", "deposit", "other"], {
			errorMap: () => ({ message: "Please select a valid payment type" }),
		})
		.optional()
		.or(z.literal("").transform(() => undefined)),

	// Student type enum validation
	studentType: z
		.enum(["high_school", "transfer", "international", "gap_year", "other"], {
			errorMap: () => ({ message: "Please select a valid student type" }),
		})
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

// Base athlete schema for creation (matches database schema)
export const athleteCreateSchema = z.object({
	// Required fields
	full_name: validationUtils.fullName,

	// Identity & Contact
	contact_email: validationUtils.email,
	phone: validationUtils.phone,
	instagram_handle: validationUtils.instagramHandle,
	gender: validationUtils.gender,
	date_of_birth: validationUtils.date,

	// Schooling
	high_school: validationUtils.text(100),
	city: validationUtils.text(100),
	state: validationUtils.text(50),
	country: validationUtils.text(50),
	graduation_year: validationUtils.graduationYear,
	year_entering_university: validationUtils.graduationYear,

	// Profiles & Academic
	athlete_net_url: validationUtils.url,
	milesplit_url: validationUtils.url,
	google_drive_folder_url: validationUtils.url,
	sat_score: validationUtils.testScore(400, 1600),
	act_score: validationUtils.testScore(1, 36),

	// Contract & Sales
	contract_date: validationUtils.date,
	go_live_date: validationUtils.date,
	sales_setter_id: validationUtils.optionalUuid,
	sales_closer_id: validationUtils.optionalUuid,
	lead_source: validationUtils.text(100),
	last_sales_call_at: validationUtils.date,
	sales_call_note: validationUtils.textarea(2000),
	sales_call_recording_url: validationUtils.url,
	initial_contract_amount_usd: validationUtils.currency,
	initial_cash_collected_usd: validationUtils.currency,
	initial_payment_type: validationUtils.paymentType,
	student_type: validationUtils.studentType,

	// Discord
	discord_channel_url: validationUtils.url,
	discord_channel_id: validationUtils.text(100),
	discord_username: validationUtils.text(100),

	// Internal
	internal_notes: validationUtils.textarea(5000),
});

// Schema for athlete updates (all fields optional except id)
export const athleteUpdateSchema = athleteCreateSchema.partial().extend({
	id: validationUtils.uuid,
});

// Form schema for athlete creation (used in forms) - more lenient for better UX
export const athleteFormSchema = z.object({
	// Required fields
	full_name: validationUtils.fullName,

	// Identity & Contact
	contact_email: z.string().optional().default(""),
	phone: z.string().optional().default(""),
	instagram_handle: z.string().optional().default(""),
	gender: z.string().optional().default(""),
	date_of_birth: z.string().optional().default(""),

	// Schooling
	high_school: z.string().optional().default(""),
	city: z.string().optional().default(""),
	state: z.string().optional().default(""),
	country: z.string().optional().default(""),
	graduation_year: z.string().optional().default(""),
	year_entering_university: z.string().optional().default(""),

	// Profiles & Academic
	athlete_net_url: z.string().optional().default(""),
	milesplit_url: z.string().optional().default(""),
	google_drive_folder_url: z.string().optional().default(""),
	sat_score: z.string().optional().default(""),
	act_score: z.string().optional().default(""),

	// Contract & Sales
	contract_date: z.string().optional().default(""),
	go_live_date: z.string().optional().default(""),
	sales_setter_id: z.string().optional().default(""),
	sales_closer_id: z.string().optional().default(""),
	lead_source: z.string().optional().default(""),
	last_sales_call_at: z.string().optional().default(""),
	sales_call_note: z.string().optional().default(""),
	sales_call_recording_url: z.string().optional().default(""),
	initial_contract_amount_usd: z.string().optional().default(""),
	initial_cash_collected_usd: z.string().optional().default(""),
	initial_payment_type: z.string().optional().default(""),
	student_type: z.string().optional().default(""),

	// Discord
	discord_channel_url: z.string().optional().default(""),
	discord_channel_id: z.string().optional().default(""),
	discord_username: z.string().optional().default(""),

	// Internal
	internal_notes: z.string().optional().default(""),
});

// Form schema for athlete updates
export const athleteEditFormSchema = athleteFormSchema.extend({
	id: validationUtils.uuid,
});

// Type exports for TypeScript
export type AthleteCreateInput = z.infer<typeof athleteCreateSchema>;
export type AthleteUpdateInput = z.infer<typeof athleteUpdateSchema>;
export type AthleteFormInput = z.infer<typeof athleteFormSchema>;
export type AthleteEditFormInput = z.infer<typeof athleteEditFormSchema>;

// Extended athlete type with relations
export interface AthleteWithRelations extends AthleteRow {
	sales_setter?: TeamMemberRow | null;
	sales_closer?: TeamMemberRow | null;
}

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
export const getFieldValidator = (fieldName: keyof AthleteFormInput) => {
	const fieldSchemas: Record<string, z.ZodSchema> = {
		full_name: validationUtils.fullName,
		contact_email: validationUtils.email,
		phone: validationUtils.phone,
		instagram_handle: validationUtils.instagramHandle,
		gender: validationUtils.gender,
		date_of_birth: validationUtils.date,
		high_school: validationUtils.text(100),
		city: validationUtils.text(100),
		state: validationUtils.text(50),
		country: validationUtils.text(50),
		graduation_year: validationUtils.graduationYear,
		year_entering_university: validationUtils.graduationYear,
		athlete_net_url: validationUtils.url,
		milesplit_url: validationUtils.url,
		google_drive_folder_url: validationUtils.url,
		sat_score: validationUtils.testScore(400, 1600),
		act_score: validationUtils.testScore(1, 36),
		contract_date: validationUtils.date,
		go_live_date: validationUtils.date,
		sales_setter_id: validationUtils.optionalUuid,
		sales_closer_id: validationUtils.optionalUuid,
		lead_source: validationUtils.text(100),
		last_sales_call_at: validationUtils.date,
		sales_call_note: validationUtils.textarea(2000),
		sales_call_recording_url: validationUtils.url,
		initial_contract_amount_usd: validationUtils.currency,
		initial_cash_collected_usd: validationUtils.currency,
		initial_payment_type: validationUtils.paymentType,
		student_type: validationUtils.studentType,
		discord_channel_url: validationUtils.url,
		discord_channel_id: validationUtils.text(100),
		discord_username: validationUtils.text(100),
		internal_notes: validationUtils.textarea(5000),
	};

	return (value: any) => validateSingleField(value, fieldSchemas[fieldName]);
};

// Type guards for better TypeScript support
export const isAthleteCreateInput = (
	data: unknown,
): data is AthleteCreateInput => {
	return athleteCreateSchema.safeParse(data).success;
};

export const isAthleteUpdateInput = (
	data: unknown,
): data is AthleteUpdateInput => {
	return athleteUpdateSchema.safeParse(data).success;
};

export const isAthleteFormInput = (data: unknown): data is AthleteFormInput => {
	return athleteFormSchema.safeParse(data).success;
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
