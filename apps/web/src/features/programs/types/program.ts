import { z } from "zod";

// Based on database.types.ts - program_gender_enum: "men" | "women"
export const programGenderEnum = z.enum(["men", "women"]);

// Flexible URL validation that accepts URLs with or without protocol
const flexibleUrlSchema = z
	.string()
	.refine(
		(val) => {
			if (!val || val.trim() === "") return true; // Allow empty
			// Check if it's a valid URL with protocol OR looks like a domain
			try {
				// Try with https:// prefix if no protocol
				const urlToTest = val.match(/^https?:\/\//) ? val : `https://${val}`;
				new URL(urlToTest);
				return true;
			} catch {
				return false;
			}
		},
		{
			message:
				"Please enter a valid URL (e.g., opskings.com or https://opskings.com)",
		},
	)
	.optional()
	.nullable();

export const programCreateSchema = z.object({
	university_id: z.string().uuid(),
	gender: programGenderEnum,
	team_url: flexibleUrlSchema,
	team_instagram: flexibleUrlSchema,
	team_twitter: flexibleUrlSchema,
	internal_notes: z.string().optional().nullable(),
});

export const programUpdateSchema = z.object({
	id: z.string().uuid(),
	gender: programGenderEnum.optional(),
	team_url: flexibleUrlSchema,
	team_instagram: flexibleUrlSchema,
	team_twitter: flexibleUrlSchema,
	internal_notes: z.string().optional().nullable(),
});

export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;
