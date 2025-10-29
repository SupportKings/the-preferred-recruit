"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import {
	clientUpdateSchema,
	formatValidationError,
} from "@/features/clients/types/client";

import { returnValidationErrors } from "next-safe-action";

export const updateClientAction = actionClient
	.inputSchema(clientUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if client exists
			const { data: existingClient, error: fetchError } = await supabase
				.from("clients")
				.select("id, email")
				.eq("id", id)
				.single();

			if (fetchError || !existingClient) {
				return returnValidationErrors(clientUpdateSchema, {
					_errors: ["Client not found"],
				});
			}

			// 2. If email is being updated, check for conflicts
			if (updateData.email && updateData.email !== existingClient.email) {
				const { data: emailConflict } = await supabase
					.from("clients")
					.select("id")
					.eq("email", updateData.email)
					.neq("id", id)
					.single();

				if (emailConflict) {
					return returnValidationErrors(clientUpdateSchema, {
						email: {
							_errors: ["Client with this email already exists"],
						},
					});
				}
			}

			// 3. Prepare update data (remove undefined values)
			const cleanUpdateData: any = Object.fromEntries(
				Object.entries(updateData).filter(([_, value]) => value !== undefined),
			);

			// Handle empty strings and "none" as null for optional fields
			const fieldsToNullify = ["billing_status_id", "onboarding_status_id"];

			fieldsToNullify.forEach((field) => {
				if (
					cleanUpdateData[field] === "" ||
					cleanUpdateData[field] === "none"
				) {
					cleanUpdateData[field] = null;
				}
			});

			// 4. Update the client record
			const { data: updatedClient, error: updateError } = await supabase
				.from("clients")
				.update(cleanUpdateData)
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating client:", updateError);
				return returnValidationErrors(clientUpdateSchema, {
					_errors: ["Failed to update client. Please try again."],
				});
			}

			if (!updatedClient) {
				return returnValidationErrors(clientUpdateSchema, {
					_errors: ["Client update failed. Please try again."],
				});
			}

			// 5. Revalidate relevant paths
			revalidatePath("/dashboard/clients");
			revalidatePath(`/dashboard/clients/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Client updated successfully",
					client: {
						id: updatedClient.id,
						client_name: updatedClient.client_name,
						first_name: updatedClient.first_name,
						last_name: updatedClient.last_name,
						email: updatedClient.email,
						billing_status_id: updatedClient.billing_status_id,
						onboarding_status_id: updatedClient.onboarding_status_id,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateClient:", error);

			return returnValidationErrors(clientUpdateSchema, {
				_errors: ["Failed to update client. Please try again."],
			});
		}
	});
