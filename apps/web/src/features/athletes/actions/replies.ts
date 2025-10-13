"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createReply(
	athleteId: string,
	replyData: {
		type: string;
		occurred_at?: string;
		summary: string;
		application_id?: string;
		university_job_id?: string;
		campaign_id?: string;
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
			athlete_id: athleteId,
			type: replyData.type,
			occurred_at: replyData.occurred_at || new Date().toISOString(),
			summary: replyData.summary,
			application_id: replyData.application_id || null,
			university_job_id: replyData.university_job_id || null,
			campaign_id: replyData.campaign_id || null,
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
		type?: string;
		occurred_at?: string;
		summary?: string;
		application_id?: string;
		university_job_id?: string;
		campaign_id?: string;
		internal_notes?: string;
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
