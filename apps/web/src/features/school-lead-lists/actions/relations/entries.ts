"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function deleteSchoolLeadListEntry(entryId: string) {
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
		throw new Error(`Failed to delete entry: ${error.message}`);
	}

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
