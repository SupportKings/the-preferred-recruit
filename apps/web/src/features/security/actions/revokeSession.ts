"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const revokeSingleSessionSchema = z.object({
	sessionToken: z.string().min(1, "Session token is required"),
});

export const revokeSession = actionClient
	.inputSchema(revokeSingleSessionSchema)
	.action(async ({ parsedInput: { sessionToken } }) => {
		try {
			await auth.api.revokeSession({
				headers: await headers(),
				body: {
					token: sessionToken,
				},
			});

			// Revalidate sessions cache
			revalidateTag("sessions");

			return {
				success: "Session revoked successfully",
			};
		} catch (error) {
			console.error("Error revoking session:", error);
			return returnValidationErrors(revokeSingleSessionSchema, {
				_errors: ["Failed to revoke session. Please try again."],
			});
		}
	});

export const revokeAllOtherSessions = actionClient.action(async () => {
	try {
		await auth.api.revokeOtherSessions({
			headers: await headers(),
		});

		// Revalidate sessions cache
		revalidateTag("sessions");

		return {
			success: "All other sessions revoked successfully",
		};
	} catch (error) {
		console.error("Error revoking all sessions:", error);
		throw new Error("Failed to revoke all sessions. Please try again.");
	}
});
