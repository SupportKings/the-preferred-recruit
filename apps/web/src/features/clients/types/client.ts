import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database types
export type ClientRow = Tables<"clients">;
export type BillingStatusRow = Tables<"billing_status">;
export type OnboardingStatusRow = Tables<"onboarding_status">;

// Validation utilities
export const validationUtils = {
	// Name validation with proper formatting
	name: z
		.string()
		.min(2, "Must be at least 2 characters")
		.max(50, "Must be less than 50 characters")
		.regex(
			/^[a-zA-Z\s'-]+$/,
			"Only letters, spaces, hyphens, and apostrophes allowed",
		)
		.transform((val) => val.trim())
		.refine((val) => val.length > 0, "Cannot be empty after trimming"),

	// Client name validation (organization/company name)
	clientName: z
		.string()
		.min(1, "Client name is required")
		.max(100, "Must be less than 100 characters")
		.transform((val) => val.trim())
		.refine((val) => val.length > 0, "Cannot be empty after trimming"),

	// Email with better validation
	email: z
		.string()
		.min(1, "Email is required")
		.email({ message: "Please enter a valid email address" })
		.max(100, "Email must be less than 100 characters")
		.toLowerCase()
		.transform((val) => val.trim()),

	// UUID validation
	uuid: z.string().uuid({ message: "Invalid ID format" }),

	// Optional UUID validation
	optionalUuid: z
		.string()
		.uuid({ message: "Invalid ID format" })
		.optional()
		.or(z.literal("").transform(() => undefined)),
};

// Base client schema for creation (matches database schema)
export const clientCreateSchema = z.object({
	client_name: validationUtils.clientName,
	email: validationUtils.email,
	first_name: validationUtils.name,
	last_name: validationUtils.name,
	billing_status_id: validationUtils.optionalUuid,
	onboarding_status_id: validationUtils.optionalUuid,
});

// Schema for client updates (all fields optional except id)
export const clientUpdateSchema = z.object({
	id: validationUtils.uuid,
	client_name: validationUtils.clientName.optional(),
	email: validationUtils.email.optional(),
	first_name: validationUtils.name.optional(),
	last_name: validationUtils.name.optional(),
	billing_status_id: validationUtils.optionalUuid,
	onboarding_status_id: validationUtils.optionalUuid,
});

// Form schema for client creation (used in forms) - more lenient for better UX
export const clientFormSchema = z.object({
	client_name: validationUtils.clientName,
	email: validationUtils.email,
	first_name: validationUtils.name,
	last_name: validationUtils.name,
	billing_status_id: z.string().optional().default(""),
	onboarding_status_id: z.string().optional().default(""),
});

// Form schema for client updates
export const clientEditFormSchema = clientFormSchema.extend({
	id: validationUtils.uuid,
});

// Type exports for TypeScript
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ClientFormInput = z.infer<typeof clientFormSchema>;
export type ClientEditFormInput = z.infer<typeof clientEditFormSchema>;

// Extended client type with relations
export interface ClientWithRelations extends ClientRow {
	billing_status?: BillingStatusRow | null;
	onboarding_status?: OnboardingStatusRow | null;
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
export const getFieldValidator = (fieldName: keyof ClientFormInput) => {
	const fieldSchemas: Record<string, z.ZodSchema> = {
		client_name: validationUtils.clientName,
		email: validationUtils.email,
		first_name: validationUtils.name,
		last_name: validationUtils.name,
		billing_status_id: validationUtils.optionalUuid,
		onboarding_status_id: validationUtils.optionalUuid,
	};

	return (value: any) => validateSingleField(value, fieldSchemas[fieldName]);
};

// Type guards for better TypeScript support
export const isClientCreateInput = (
	data: unknown,
): data is ClientCreateInput => {
	return clientCreateSchema.safeParse(data).success;
};

export const isClientUpdateInput = (
	data: unknown,
): data is ClientUpdateInput => {
	return clientUpdateSchema.safeParse(data).success;
};

export const isClientFormInput = (data: unknown): data is ClientFormInput => {
	return clientFormSchema.safeParse(data).success;
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
