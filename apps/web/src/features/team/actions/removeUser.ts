"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

export const removeUser = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { userId } }) => {
		try {
			// Now ban the user through the auth system
			const bannedUser = await auth.api.banUser({
				body: {
					userId,
				},
				headers: await headers(),
			});

			return {
				success: "User removed successfully",
				user: bannedUser,
			};
		} catch (error) {
			console.error("Error in removeUser:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to remove user. Please try again."],
			});
		}
	});
