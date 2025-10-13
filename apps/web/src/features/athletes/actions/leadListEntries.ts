"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createLeadListEntry(data: {
	lead_list_id: string;
	university_id: string;
	program_id?: string;
	status?: string;
	priority?: string;
	internal_notes?: string;
}) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data: entry, error } = await supabase
		.from("school_lead_list_entries")
		.insert({
			school_lead_list_id: data.lead_list_id,
			university_id: data.university_id,
			program_id: data.program_id,
			status: data.status,
			priority: data.priority,
			internal_notes: data.internal_notes,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create lead list entry: ${error.message}`);
	}

	return { success: true, data: entry };
}

export async function updateLeadListEntry(
	entryId: string,
	data: {
		status?: string;
		priority?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data: entry, error } = await supabase
		.from("school_lead_list_entries")
		.update({
			status: data.status,
			priority: data.priority,
			internal_notes: data.internal_notes,
		})
		.eq("id", entryId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update lead list entry: ${error.message}`);
	}

	return { success: true, data: entry };
}

export async function deleteLeadListEntry(entryId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("school_lead_list_entries")
		.delete()
		.eq("id", entryId);

	if (error) {
		throw new Error(`Failed to delete lead list entry: ${error.message}`);
	}

	return { success: true };
}
