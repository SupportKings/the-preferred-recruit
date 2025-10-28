"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";
import { revalidatePath } from "next/cache";

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

	// Soft delete: set is_deleted, deleted_at, and deleted_by
	const { error } = await supabase
		.from("school_lead_list_entries")
		.update({
			is_deleted: true,
			deleted_at: new Date().toISOString(),
			deleted_by: null,
		})
		.eq("id", entryId);

	if (error) {
		throw new Error(`Failed to delete lead list entry: ${error.message}`);
	}

	// Revalidate the athlete detail page to refresh the list
	revalidatePath("/dashboard/athletes/[id]", "page");

	return { success: true };
}
