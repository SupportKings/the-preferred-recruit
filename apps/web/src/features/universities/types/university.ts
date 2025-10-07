import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

export type University = Tables<"universities">;

export interface UniversityFilters {
	columnId: string;
	operator: string;
	values: string[];
}

export interface UniversitySorting {
	id: string;
	desc: boolean;
}

// Validation utilities
export const universityValidation = {
	name: z.string().min(1, "University name is required").max(255),
	email_blocked: z.boolean().optional().nullable(),
	type_public_private: z.string().max(50).optional().nullable(),
	religious_affiliation: z.string().max(100).optional().nullable(),
	city: z.string().max(100).optional().nullable(),
	size_of_city: z.string().max(50).optional().nullable(),
	state: z.string().max(2).optional().nullable(),
	region: z.string().max(100).optional().nullable(),
	average_gpa: z.number().min(0).max(5).optional().nullable(),
	sat_ebrw_25th: z.number().min(200).max(800).optional().nullable(),
	sat_ebrw_75th: z.number().min(200).max(800).optional().nullable(),
	sat_math_25th: z.number().min(200).max(800).optional().nullable(),
	sat_math_75th: z.number().min(200).max(800).optional().nullable(),
	act_composite_25th: z.number().min(1).max(36).optional().nullable(),
	act_composite_75th: z.number().min(1).max(36).optional().nullable(),
	acceptance_rate_pct: z.number().min(0).max(100).optional().nullable(),
	total_yearly_cost: z.number().min(0).optional().nullable(),
	majors_offered_url: z.string().url().optional().nullable().or(z.literal("")),
	undergraduate_enrollment: z.number().min(0).optional().nullable(),
	us_news_ranking_national_2018: z.number().min(1).optional().nullable(),
	us_news_ranking_liberal_arts_2018: z.number().min(1).optional().nullable(),
	ipeds_nces_id: z.string().max(50).optional().nullable(),
	internal_notes: z.string().optional().nullable(),
};

// Create schema for server validation (strict)
export const universityCreateSchema = z.object({
	name: universityValidation.name,
	email_blocked: universityValidation.email_blocked,
	type_public_private: universityValidation.type_public_private,
	religious_affiliation: universityValidation.religious_affiliation,
	city: universityValidation.city,
	size_of_city: universityValidation.size_of_city,
	state: universityValidation.state,
	region: universityValidation.region,
	average_gpa: universityValidation.average_gpa,
	sat_ebrw_25th: universityValidation.sat_ebrw_25th,
	sat_ebrw_75th: universityValidation.sat_ebrw_75th,
	sat_math_25th: universityValidation.sat_math_25th,
	sat_math_75th: universityValidation.sat_math_75th,
	act_composite_25th: universityValidation.act_composite_25th,
	act_composite_75th: universityValidation.act_composite_75th,
	acceptance_rate_pct: universityValidation.acceptance_rate_pct,
	total_yearly_cost: universityValidation.total_yearly_cost,
	majors_offered_url: universityValidation.majors_offered_url,
	undergraduate_enrollment: universityValidation.undergraduate_enrollment,
	us_news_ranking_national_2018:
		universityValidation.us_news_ranking_national_2018,
	us_news_ranking_liberal_arts_2018:
		universityValidation.us_news_ranking_liberal_arts_2018,
	ipeds_nces_id: universityValidation.ipeds_nces_id,
	internal_notes: universityValidation.internal_notes,
});

export type UniversityCreate = z.infer<typeof universityCreateSchema>;

// Form schema (accepts strings for number inputs, will be transformed)
export const universityFormSchema = z.object({
	name: universityValidation.name,
	email_blocked: z.boolean().default(false),
	type_public_private: z.string().optional().default(""),
	religious_affiliation: z.string().optional().default(""),
	city: z.string().optional().default(""),
	size_of_city: z.string().optional().default(""),
	state: z.string().optional().default(""),
	region: z.string().optional().default(""),
	average_gpa: z.string().optional().default(""),
	sat_ebrw_25th: z.string().optional().default(""),
	sat_ebrw_75th: z.string().optional().default(""),
	sat_math_25th: z.string().optional().default(""),
	sat_math_75th: z.string().optional().default(""),
	act_composite_25th: z.string().optional().default(""),
	act_composite_75th: z.string().optional().default(""),
	acceptance_rate_pct: z.string().optional().default(""),
	total_yearly_cost: z.string().optional().default(""),
	majors_offered_url: z.string().optional().default(""),
	undergraduate_enrollment: z.string().optional().default(""),
	us_news_ranking_national_2018: z.string().optional().default(""),
	us_news_ranking_liberal_arts_2018: z.string().optional().default(""),
	ipeds_nces_id: z.string().optional().default(""),
	internal_notes: z.string().optional().default(""),
});

export type UniversityFormData = z.infer<typeof universityFormSchema>;

// Helper to validate single field
export function validateSingleField(
	field: keyof typeof universityValidation,
	value: unknown,
): { success: boolean; error?: string } {
	try {
		universityValidation[field].parse(value);
		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error: error.errors[0]?.message };
		}
		return { success: false, error: "Validation failed" };
	}
}

// Helper to get all validation errors from next-safe-action validation errors
export function getAllValidationErrors(validationErrors: any): string[] {
	const errors: string[] = [];
	for (const [_field, fieldErrors] of Object.entries(validationErrors)) {
		if (
			typeof fieldErrors === "object" &&
			fieldErrors !== null &&
			"_errors" in fieldErrors
		) {
			const errArray = (fieldErrors as { _errors: string[] })._errors;
			errors.push(...errArray);
		}
	}
	return errors;
}

// City size options
export const citySizeOptions = [
	{ value: "small", label: "Small" },
	{ value: "medium", label: "Medium" },
	{ value: "large", label: "Large" },
	{ value: "very_large", label: "Very Large" },
] as const;

// Public/Private type options
export const publicPrivateOptions = [
	{ value: "public", label: "Public" },
	{ value: "private", label: "Private" },
] as const;

// US State options
export const stateOptions = [
	{ value: "AL", label: "Alabama" },
	{ value: "AK", label: "Alaska" },
	{ value: "AZ", label: "Arizona" },
	{ value: "AR", label: "Arkansas" },
	{ value: "CA", label: "California" },
	{ value: "CO", label: "Colorado" },
	{ value: "CT", label: "Connecticut" },
	{ value: "DE", label: "Delaware" },
	{ value: "FL", label: "Florida" },
	{ value: "GA", label: "Georgia" },
	{ value: "HI", label: "Hawaii" },
	{ value: "ID", label: "Idaho" },
	{ value: "IL", label: "Illinois" },
	{ value: "IN", label: "Indiana" },
	{ value: "IA", label: "Iowa" },
	{ value: "KS", label: "Kansas" },
	{ value: "KY", label: "Kentucky" },
	{ value: "LA", label: "Louisiana" },
	{ value: "ME", label: "Maine" },
	{ value: "MD", label: "Maryland" },
	{ value: "MA", label: "Massachusetts" },
	{ value: "MI", label: "Michigan" },
	{ value: "MN", label: "Minnesota" },
	{ value: "MS", label: "Mississippi" },
	{ value: "MO", label: "Missouri" },
	{ value: "MT", label: "Montana" },
	{ value: "NE", label: "Nebraska" },
	{ value: "NV", label: "Nevada" },
	{ value: "NH", label: "New Hampshire" },
	{ value: "NJ", label: "New Jersey" },
	{ value: "NM", label: "New Mexico" },
	{ value: "NY", label: "New York" },
	{ value: "NC", label: "North Carolina" },
	{ value: "ND", label: "North Dakota" },
	{ value: "OH", label: "Ohio" },
	{ value: "OK", label: "Oklahoma" },
	{ value: "OR", label: "Oregon" },
	{ value: "PA", label: "Pennsylvania" },
	{ value: "RI", label: "Rhode Island" },
	{ value: "SC", label: "South Carolina" },
	{ value: "SD", label: "South Dakota" },
	{ value: "TN", label: "Tennessee" },
	{ value: "TX", label: "Texas" },
	{ value: "UT", label: "Utah" },
	{ value: "VT", label: "Vermont" },
	{ value: "VA", label: "Virginia" },
	{ value: "WA", label: "Washington" },
	{ value: "WV", label: "West Virginia" },
	{ value: "WI", label: "Wisconsin" },
	{ value: "WY", label: "Wyoming" },
] as const;
