"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

// Type for sending email with domain info and primary status
export interface SendingEmailWithStatus {
	id: string;
	username: string | null;
	name: string | null;
	internal_notes: string | null;
	domain_id: string | null;
	domain: {
		id: string;
		domain_url: string | null;
	} | null;
	is_primary: boolean;
}

// Fetch all sending emails for an athlete through their domains
export async function getAthleteSendingEmails(
	athleteId: string,
): Promise<SendingEmailWithStatus[]> {
	try {
		const supabase = await createClient();

		// First get all domains for this athlete
		const { data: domains, error: domainsError } = await supabase
			.from("domains")
			.select("id")
			.eq("athlete_id", athleteId)
			.eq("is_deleted", false);

		if (domainsError || !domains || domains.length === 0) {
			return [];
		}

		const domainIds = domains.map((d) => d.id);

		// Get all sending emails for these domains
		const { data: sendingEmails, error: emailsError } = await supabase
			.from("email_sending_accounts")
			.select(
				"id, username, name, internal_notes, domain_id, domain:domains(id, domain_url)",
			)
			.in("domain_id", domainIds)
			.eq("is_deleted", false)
			.order("username");

		if (emailsError || !sendingEmails) {
			console.error("Error fetching sending emails:", emailsError);
			return [];
		}

		// Get the athlete's current primary sending email ID
		const { data: athlete } = await supabase
			.from("athletes")
			.select("sending_email_id")
			.eq("id", athleteId)
			.single();

		const primaryEmailId = athlete?.sending_email_id;

		// Map the results with is_primary flag
		return sendingEmails.map((email) => {
			// Supabase returns domain as an array when using nested select
			const domainData = Array.isArray(email.domain)
				? email.domain[0]
				: email.domain;
			return {
				...email,
				domain: domainData as SendingEmailWithStatus["domain"],
				is_primary: email.id === primaryEmailId,
			};
		});
	} catch (error) {
		console.error("Error in getAthleteSendingEmails:", error);
		return [];
	}
}

// Schema for setting primary sending email
const setPrimarySendingEmailSchema = z.object({
	athleteId: z.string().uuid(),
	sendingEmailId: z.string().uuid().nullable(),
});

// Action to set a sending email as primary for an athlete
export const setPrimarySendingEmail = actionClient
	.inputSchema(setPrimarySendingEmailSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// If sendingEmailId is provided, verify it belongs to the athlete's domains
			if (parsedInput.sendingEmailId) {
				const { data: sendingEmail } = await supabase
					.from("email_sending_accounts")
					.select("id, domain:domains(athlete_id)")
					.eq("id", parsedInput.sendingEmailId)
					.eq("is_deleted", false)
					.single();

				if (!sendingEmail) {
					throw new Error("Sending email account not found");
				}

				// Supabase returns domain as an array when using nested select with .single()
				const domainData = Array.isArray(sendingEmail.domain)
					? sendingEmail.domain[0]
					: sendingEmail.domain;
				const domain = domainData as { athlete_id: string | null } | null;
				if (domain?.athlete_id !== parsedInput.athleteId) {
					throw new Error("Sending email does not belong to this athlete");
				}
			}

			// Update the athlete's sending_email_id
			const { error } = await supabase
				.from("athletes")
				.update({ sending_email_id: parsedInput.sendingEmailId })
				.eq("id", parsedInput.athleteId);

			if (error) {
				console.error("Error setting primary sending email:", error);
				throw new Error("Failed to set primary sending email");
			}

			revalidatePath("/dashboard/athletes");
			revalidatePath(`/dashboard/athletes/${parsedInput.athleteId}`);

			return { success: true };
		} catch (error) {
			console.error("Error in setPrimarySendingEmail:", error);
			throw error;
		}
	});

// Schema for creating a domain
const createDomainSchema = z.object({
	domain_url: z
		.string()
		.min(1, "Domain URL is required")
		.regex(
			/^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i,
			"Invalid domain format (e.g., example.com)",
		),
	athlete_id: z.string().uuid().optional(),
	internal_notes: z.string().optional(),
});

// Schema for creating a sending email account
const createSendingEmailSchema = z.object({
	username: z
		.string()
		.min(1, "Username is required")
		.regex(/^[a-z0-9._-]+$/i, "Invalid username format"),
	domain_id: z.string().uuid({ message: "Domain is required" }),
	name: z.string().optional().nullable(),
	internal_notes: z.string().optional().nullable(),
});

// Schema for updating a sending email account
const updateSendingEmailSchema = z.object({
	id: z.string().uuid(),
	username: z
		.string()
		.min(1, "Username is required")
		.regex(/^[a-z0-9._-]+$/i, "Invalid username format")
		.optional(),
	name: z.string().optional(),
	domain_id: z.string().uuid().optional(),
	internal_notes: z.string().optional(),
});

export const createDomain = actionClient
	.schema(createDomainSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		// Check if domain already exists
		const { data: existing } = await (supabase as any)
			.from("domains")
			.select("id, domain_url")
			.eq("domain_url", parsedInput.domain_url)
			.eq("is_deleted", false)
			.single();

		if (existing) {
			returnValidationErrors(createDomainSchema, {
				domain_url: {
					_errors: [
						`Domain "${parsedInput.domain_url}" already exists. Please select it from the dropdown instead.`,
					],
				},
			});
		}

		const { data, error } = await (supabase as any)
			.from("domains")
			.insert({
				domain_url: parsedInput.domain_url,
				athlete_id: parsedInput.athlete_id,
				internal_notes: parsedInput.internal_notes,
				is_deleted: false,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating domain:", error);
			returnValidationErrors(createDomainSchema, {
				_errors: ["Failed to create domain"],
			});
		}

		revalidatePath("/dashboard/athletes");

		return { success: true, domain: data };
	});

export const createSendingEmail = actionClient
	.inputSchema(createSendingEmailSchema)
	.action(async ({ parsedInput }) => {
		try {
			console.log("createSendingEmail called with:", parsedInput);
			const supabase = await createClient();

			// Check if username + domain combination already exists
			const { data: existing } = await supabase
				.from("email_sending_accounts")
				.select("id, username")
				.eq("username", parsedInput.username)
				.eq("domain_id", parsedInput.domain_id)
				.eq("is_deleted", false)
				.maybeSingle();

			if (existing) {
				throw new Error(
					"This email address already exists for the selected domain",
				);
			}

			const { data: newSendingEmail, error } = await supabase
				.from("email_sending_accounts")
				.insert({
					username: parsedInput.username,
					name: parsedInput.name || null,
					domain_id: parsedInput.domain_id,
					internal_notes: parsedInput.internal_notes || null,
					is_deleted: false,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating sending email:", error);
				throw new Error("Failed to create sending email account");
			}

			revalidatePath("/dashboard/athletes");

			return newSendingEmail;
		} catch (error) {
			console.error("Unexpected error in createSendingEmail:", error);
			throw error;
		}
	});

export const updateSendingEmail = actionClient
	.schema(updateSendingEmailSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// Check if account exists
			const { data: existing, error: fetchError } = await (supabase as any)
				.from("email_sending_accounts")
				.select("id")
				.eq("id", id)
				.eq("is_deleted", false)
				.single();

			if (fetchError || !existing) {
				return returnValidationErrors(updateSendingEmailSchema, {
					_errors: ["Sending email account not found"],
				});
			}

			// Check for duplicate username + domain combination if those fields are being updated
			if (updateData.username || updateData.domain_id) {
				const usernameToCheck = updateData.username;
				const domainToCheck = updateData.domain_id;

				if (usernameToCheck && domainToCheck) {
					const { data: duplicate } = await (supabase as any)
						.from("email_sending_accounts")
						.select("id")
						.eq("username", usernameToCheck)
						.eq("domain_id", domainToCheck)
						.neq("id", id)
						.eq("is_deleted", false)
						.single();

					if (duplicate) {
						return returnValidationErrors(updateSendingEmailSchema, {
							username: {
								_errors: [
									"This email address already exists for the selected domain",
								],
							},
						});
					}
				}
			}

			const cleanUpdateData: any = {};
			if (updateData.username !== undefined)
				cleanUpdateData.username = updateData.username;
			if (updateData.name !== undefined) cleanUpdateData.name = updateData.name;
			if (updateData.domain_id !== undefined)
				cleanUpdateData.domain_id = updateData.domain_id;
			if (updateData.internal_notes !== undefined)
				cleanUpdateData.internal_notes = updateData.internal_notes;

			const { data, error } = await (supabase as any)
				.from("email_sending_accounts")
				.update(cleanUpdateData)
				.eq("id", id)
				.eq("is_deleted", false)
				.select("*, domain:domains(domain_url)")
				.single();

			if (error) {
				console.error("Error updating sending email:", error);
				return returnValidationErrors(updateSendingEmailSchema, {
					_errors: ["Failed to update sending email account"],
				});
			}

			revalidatePath("/dashboard/athletes");

			return data;
		} catch (error) {
			console.error("Unexpected error in updateSendingEmail:", error);
			return returnValidationErrors(updateSendingEmailSchema, {
				_errors: ["Failed to update sending email account. Please try again."],
			});
		}
	});
