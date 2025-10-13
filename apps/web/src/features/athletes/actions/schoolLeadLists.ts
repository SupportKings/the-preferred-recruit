"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createSchoolLeadList(
	athleteId: string,
	leadListData: {
		name: string;
		priority?: number;
		type?: string;
		season_label?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("school_lead_lists")
		.insert({
			athlete_id: athleteId,
			name: leadListData.name,
			priority: leadListData.priority || null,
			type: leadListData.type || null,
			season_label: leadListData.season_label || null,
			internal_notes: leadListData.internal_notes || null,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create school lead list: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateSchoolLeadList(
	leadListId: string,
	leadListData: {
		name?: string;
		priority?: number;
		type?: string;
		season_label?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("school_lead_lists")
		.update(leadListData)
		.eq("id", leadListId);

	if (error) {
		throw new Error(`Failed to update school lead list: ${error.message}`);
	}

	return { success: true };
}

export async function deleteSchoolLeadList(leadListId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("school_lead_lists")
		.delete()
		.eq("id", leadListId);

	if (error) {
		throw new Error(`Failed to delete school lead list: ${error.message}`);
	}

	return { success: true };
}
