"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

export const deleteContact = actionClient
	.inputSchema(z.object({ id: z.string() }))
	.action(async ({ parsedInput: { id } }) => {
		const supabase = await createClient();

		const { error } = await supabase.from("contacts").delete().eq("id", id);

		if (error) {
			console.error("Failed to delete contact:", error);
			throw new Error("Failed to delete contact");
		}

		revalidatePath("/dashboard/contacts");

		return { success: true };
	});
