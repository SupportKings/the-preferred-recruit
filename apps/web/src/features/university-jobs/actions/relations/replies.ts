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

export async function createReply(
	universityJobId: string,
	replyData: {
		type?: string | null;
		occurred_at?: string | null;
		summary?: string | null;
		campaign_id?: string | null;
		application_id?: string | null;
		athlete_id?: string | null;
		internal_notes?: string | null;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("replies")
		.insert({
			university_job_id: universityJobId,
			...replyData,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create reply: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateReply(
	replyId: string,
	replyData: {
		type?: string | null;
		occurred_at?: string | null;
		summary?: string | null;
		internal_notes?: string | null;
	},
) {
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
