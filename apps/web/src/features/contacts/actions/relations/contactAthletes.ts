"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function deleteContactAthlete(relationId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get athlete_id and contact_id before deleting
	const { data: relation } = await supabase
		.from("contact_athletes")
		.select("athlete_id, contact_id")
		.eq("id", relationId)
		.single();

	const { error } = await supabase
		.from("contact_athletes")
		.delete()
		.eq("id", relationId);

	if (error) {
		throw new Error(
			`Failed to delete contact-athlete relationship: ${error.message}`,
		);
	}

	// Revalidate both athlete and contact detail pages
	if (relation?.athlete_id) {
		revalidatePath(`/dashboard/athletes/${relation.athlete_id}`);
	}
	if (relation?.contact_id) {
		revalidatePath(`/dashboard/contacts/${relation.contact_id}`);
	}

	return { success: true };
}

export async function createContactAthlete(
	contactId: string,
	relationData: {
		athlete_id: string;
		relationship: string;
		is_primary?: boolean;
		internal_notes?: string;
		start_date?: string;
		end_date?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("contact_athletes")
		.insert({
			contact_id: contactId,
			athlete_id: relationData.athlete_id,
			relationship: relationData.relationship,
			is_primary: relationData.is_primary || false,
			internal_notes: relationData.internal_notes || null,
			start_date: relationData.start_date || null,
			end_date: relationData.end_date || null,
		})
		.select()
		.single();

	if (error) {
		throw new Error(
			`Failed to create contact-athlete relationship: ${error.message}`,
		);
	}

	// Revalidate both athlete and contact detail pages
	revalidatePath(`/dashboard/athletes/${relationData.athlete_id}`);
	revalidatePath(`/dashboard/contacts/${contactId}`);

	return { success: true, data };
}

export async function updateContactAthlete(
	relationId: string,
	relationData: {
		athlete_id?: string;
		relationship?: string;
		is_primary?: boolean;
		internal_notes?: string;
		start_date?: string;
		end_date?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get athlete_id and contact_id before updating
	const { data: relation } = await supabase
		.from("contact_athletes")
		.select("athlete_id, contact_id")
		.eq("id", relationId)
		.single();

	const { error } = await supabase
		.from("contact_athletes")
		.update(relationData)
		.eq("id", relationId);

	if (error) {
		throw new Error(
			`Failed to update contact-athlete relationship: ${error.message}`,
		);
	}

	// Revalidate both athlete and contact detail pages
	if (relation?.athlete_id) {
		revalidatePath(`/dashboard/athletes/${relation.athlete_id}`);
	}
	if (relation?.contact_id) {
		revalidatePath(`/dashboard/contacts/${relation.contact_id}`);
	}

	return { success: true };
}

// Athlete-side actions
export async function createAthleteContact(
	athleteId: string,
	relationData: {
		contact_id?: string;
		full_name?: string;
		email?: string;
		phone?: string;
		preferred_contact_method?: string;
		relationship: string;
		is_primary?: boolean;
		internal_notes?: string;
		start_date?: string;
		end_date?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	let contactId = relationData.contact_id;

	// If no contact_id provided but we have contact details, create new contact
	if (!contactId && relationData.full_name) {
		const { data: newContact, error: contactError } = await supabase
			.from("contacts")
			.insert({
				full_name: relationData.full_name,
				email: relationData.email || null,
				phone: relationData.phone || null,
				preferred_contact_method: relationData.preferred_contact_method || null,
			})
			.select()
			.single();

		if (contactError) {
			throw new Error(`Failed to create contact: ${contactError.message}`);
		}

		contactId = newContact.id;
	}

	if (!contactId) {
		throw new Error("Contact ID is required");
	}

	const { data, error } = await supabase
		.from("contact_athletes")
		.insert({
			contact_id: contactId,
			athlete_id: athleteId,
			relationship: relationData.relationship,
			is_primary: relationData.is_primary || false,
			internal_notes: relationData.internal_notes || null,
			start_date: relationData.start_date || null,
			end_date: relationData.end_date || null,
		})
		.select()
		.single();

	if (error) {
		throw new Error(
			`Failed to create athlete-contact relationship: ${error.message}`,
		);
	}

	// Revalidate both athlete and contact detail pages
	revalidatePath(`/dashboard/athletes/${athleteId}`);
	revalidatePath(`/dashboard/contacts/${contactId}`);

	return { success: true, data };
}

export async function updateAthleteContact(
	relationId: string,
	relationData: {
		relationship?: string;
		is_primary?: boolean;
		internal_notes?: string;
		start_date?: string;
		end_date?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get athlete_id and contact_id before updating
	const { data: relation } = await supabase
		.from("contact_athletes")
		.select("athlete_id, contact_id")
		.eq("id", relationId)
		.single();

	const { error } = await supabase
		.from("contact_athletes")
		.update(relationData)
		.eq("id", relationId);

	if (error) {
		throw new Error(
			`Failed to update athlete-contact relationship: ${error.message}`,
		);
	}

	// Revalidate both athlete and contact detail pages
	if (relation?.athlete_id) {
		revalidatePath(`/dashboard/athletes/${relation.athlete_id}`);
	}
	if (relation?.contact_id) {
		revalidatePath(`/dashboard/contacts/${relation.contact_id}`);
	}

	return { success: true };
}
