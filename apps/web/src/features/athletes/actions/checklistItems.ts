"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function getOrCreateChecklist(athleteId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// First, try to find existing checklist
	const { data: existingChecklist } = await supabase
		.from("checklists")
		.select("id")
		.eq("athlete_id", athleteId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (existingChecklist) {
		return { success: true, data: existingChecklist };
	}

	// No checklist exists, create one
	const { data: newChecklist, error } = await supabase
		.from("checklists")
		.insert({
			athlete_id: athleteId,
		})
		.select("id")
		.single();

	if (error) {
		throw new Error(`Failed to create checklist: ${error.message}`);
	}

	return { success: true, data: newChecklist };
}

export async function createChecklistItem(checklistItemData: {
	checklist_id: string;
	template_item_id?: string;
	title: string;
	description?: string;
	sort_order?: number;
	required?: boolean;
	is_applicable?: boolean;
}) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("checklist_items")
		.insert({
			checklist_id: checklistItemData.checklist_id,
			template_item_id: checklistItemData.template_item_id || null,
			title: checklistItemData.title,
			description: checklistItemData.description || null,
			sort_order: checklistItemData.sort_order || null,
			required: checklistItemData.required || false,
			is_applicable: checklistItemData.is_applicable ?? true,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create checklist item: ${error.message}`);
	}

	// Get athlete_id from checklist to revalidate athlete detail page
	const { data: checklist } = await supabase
		.from("checklists")
		.select("athlete_id")
		.eq("id", checklistItemData.checklist_id)
		.single();

	if (checklist?.athlete_id) {
		revalidatePath(`/dashboard/athletes/${checklist.athlete_id}`);
	}

	return { success: true, data };
}

export async function updateChecklistItem(
	itemId: string,
	itemData: {
		title?: string;
		description?: string;
		sort_order?: number;
		required?: boolean;
		is_applicable?: boolean;
		blocked_reason?: string;
		is_done?: boolean;
		done_at?: string;
		done_by_team_member_id?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get athlete_id before updating to revalidate athlete detail page
	const { data: item } = await supabase
		.from("checklist_items")
		.select("checklist_id")
		.eq("id", itemId)
		.single();

	const { error } = await supabase
		.from("checklist_items")
		.update(itemData)
		.eq("id", itemId);

	if (error) {
		throw new Error(`Failed to update checklist item: ${error.message}`);
	}

	// Get athlete_id from checklist to revalidate
	if (item?.checklist_id) {
		const { data: checklist } = await supabase
			.from("checklists")
			.select("athlete_id")
			.eq("id", item.checklist_id)
			.single();

		if (checklist?.athlete_id) {
			revalidatePath(`/dashboard/athletes/${checklist.athlete_id}`);
		}
	}

	return { success: true };
}

export async function deleteChecklistItem(itemId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get athlete_id before deleting to revalidate athlete detail page
	const { data: item } = await supabase
		.from("checklist_items")
		.select("checklist_id")
		.eq("id", itemId)
		.single();

	const { error } = await supabase
		.from("checklist_items")
		.delete()
		.eq("id", itemId);

	if (error) {
		throw new Error(`Failed to delete checklist item: ${error.message}`);
	}

	// Get athlete_id from checklist to revalidate
	if (item?.checklist_id) {
		const { data: checklist } = await supabase
			.from("checklists")
			.select("athlete_id")
			.eq("id", item.checklist_id)
			.single();

		if (checklist?.athlete_id) {
			revalidatePath(`/dashboard/athletes/${checklist.athlete_id}`);
		}
	}

	return { success: true };
}
