"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

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

	const { error } = await supabase
		.from("checklist_items")
		.update(itemData)
		.eq("id", itemId);

	if (error) {
		throw new Error(`Failed to update checklist item: ${error.message}`);
	}

	return { success: true };
}

export async function deleteChecklistItem(itemId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("checklist_items")
		.delete()
		.eq("id", itemId);

	if (error) {
		throw new Error(`Failed to delete checklist item: ${error.message}`);
	}

	return { success: true };
}
