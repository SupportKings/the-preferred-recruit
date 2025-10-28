"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function deleteSchoolLeadListEntry(entryId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get team member ID for the current user
	const { data: teamMember } = await supabase
		.from("team_members")
		.select("id")
		.eq("user_id", user.user.id)
		.maybeSingle();

	// Soft delete by setting is_deleted flag
	// Do update and select in one operation to get entry details for revalidation
	const { data: deletedEntry, error } = await supabase
		.from("school_lead_list_entries")
		.update({
			is_deleted: true,
			deleted_at: new Date().toISOString(),
			deleted_by: teamMember?.id || null,
		})
		.eq("id", entryId)
		.eq("is_deleted", false) // Only update if not already deleted
		.select("id, school_lead_list_id, university_id")
		.maybeSingle();

	if (error) {
		throw new Error(`Failed to delete entry: ${error.message}`);
	}

	if (!deletedEntry) {
		throw new Error("Entry not found or already deleted");
	}

	const entry = deletedEntry;

	// Revalidate paths
	revalidatePath("/dashboard/school-lead-lists");
	revalidatePath(`/dashboard/school-lead-lists/${entry.school_lead_list_id}`);
	revalidatePath(`/dashboard/universities/${entry.university_id}`);

	return { success: true };
}

export async function createSchoolLeadListEntry(
	leadListId: string,
	entryData: {
		university_id: string;
		program_id?: string | null;
		status?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("school_lead_list_entries")
		.insert({
			school_lead_list_id: leadListId,
			university_id: entryData.university_id,
			program_id: entryData.program_id || null,
			status: entryData.status || "included",
			internal_notes: entryData.internal_notes || null,
			added_at: new Date().toISOString(),
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create entry: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateSchoolLeadListEntry(
	entryId: string,
	entryData: {
		program_id?: string | null;
		status?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("school_lead_list_entries")
		.update(entryData)
		.eq("id", entryId);

	if (error) {
		throw new Error(`Failed to update entry: ${error.message}`);
	}

	return { success: true };
}
