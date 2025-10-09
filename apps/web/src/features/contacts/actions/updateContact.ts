"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const contactUpdateSchema = z.object({
	id: z.string(),
	full_name: z.string().min(1, "Full name is required").optional(),
	email: z.string().email("Invalid email").optional().nullable(),
	phone: z.string().optional().nullable(),
	preferred_contact_method: z.string().optional().nullable(),
	internal_notes: z.string().optional().nullable(),
});

export const updateContactAction = actionClient
	.inputSchema(contactUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// Check if contact exists
			const { data: existingContact, error: fetchError } = await supabase
				.from("contacts")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existingContact) {
				return returnValidationErrors(contactUpdateSchema, {
					_errors: ["Contact not found"],
				});
			}

			// Prepare update data
			const cleanUpdateData: any = {};

			if (updateData.full_name !== undefined)
				cleanUpdateData.full_name = updateData.full_name;
			if (updateData.email !== undefined)
				cleanUpdateData.email = updateData.email;
			if (updateData.phone !== undefined)
				cleanUpdateData.phone = updateData.phone;
			if (updateData.preferred_contact_method !== undefined)
				cleanUpdateData.preferred_contact_method =
					updateData.preferred_contact_method;
			if (updateData.internal_notes !== undefined)
				cleanUpdateData.internal_notes = updateData.internal_notes;

			// Update the contact record
			const { data: updatedContact, error: updateError } = await supabase
				.from("contacts")
				.update(cleanUpdateData)
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating contact:", updateError);
				return returnValidationErrors(contactUpdateSchema, {
					_errors: ["Failed to update contact. Please try again."],
				});
			}

			if (!updatedContact) {
				return returnValidationErrors(contactUpdateSchema, {
					_errors: ["Contact update failed. Please try again."],
				});
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/contacts");
			revalidatePath(`/dashboard/contacts/${id}`);

			return {
				success: true,
				data: {
					success: "Contact updated successfully",
					contact: updatedContact,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateContact:", error);

			return returnValidationErrors(contactUpdateSchema, {
				_errors: ["Failed to update contact. Please try again."],
			});
		}
	});
