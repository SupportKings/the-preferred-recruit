"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const createContactSchema = z.object({
	full_name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email").optional().nullable(),
	phone: z.string().optional().nullable(),
	preferred_contact_method: z.string().optional().nullable(),
	internal_notes: z.string().optional().nullable(),
});

export const createContactAction = actionClient
	.inputSchema(createContactSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { data: newContact, error } = await supabase
				.from("contacts")
				.insert({
					full_name: parsedInput.full_name,
					email: parsedInput.email || null,
					phone: parsedInput.phone || null,
					preferred_contact_method:
						parsedInput.preferred_contact_method || null,
					internal_notes: parsedInput.internal_notes || null,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating contact:", error);
				throw new Error("Failed to create contact");
			}

			revalidatePath("/dashboard/contacts");

			return {
				success: true,
				data: newContact,
			};
		} catch (error) {
			console.error("Unexpected error in createContact:", error);
			throw error;
		}
	});
