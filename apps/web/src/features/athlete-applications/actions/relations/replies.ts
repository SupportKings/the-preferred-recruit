"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function deleteReply(replyId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase.from("replies").delete().eq("id", replyId);

	if (error) {
		throw new Error(`Failed to delete reply: ${error.message}`);
	}

	return { success: true };
}

export async function createReply(applicationId: string, replyData: any) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("replies")
		.insert({
			application_id: applicationId,
			...replyData,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create reply: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateReply(replyId: string, replyData: any) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("replies")
		.update(replyData)
		.eq("id", replyId);

	if (error) {
		throw new Error(`Failed to update reply: ${error.message}`);
	}

	return { success: true };
}
