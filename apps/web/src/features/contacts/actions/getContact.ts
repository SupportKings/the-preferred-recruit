"use server";

import { createClient } from "@/utils/supabase/server";

export async function getContact(id: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("contacts")
		.select(
			`
			*,
			contact_athletes (
				*,
				athlete:athletes (*)
			)
		`,
		)
		.eq("id", id)
		.single();

	if (error) {
		console.error("Error fetching contact:", error);
		return null;
	}

	return data;
}
