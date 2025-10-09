"use client";

import { createClient } from "@/utils/supabase/client";

import { useQuery } from "@tanstack/react-query";
import type { Contact } from "../types/contact";

export const contactQueries = {
	all: ["contacts"] as const,
	lists: () => [...contactQueries.all, "list"] as const,
	list: (filters?: any) => [...contactQueries.lists(), { filters }] as const,
	details: () => [...contactQueries.all, "detail"] as const,
	detail: (id: string) => [...contactQueries.details(), id] as const,
};

export async function getContact(id: string): Promise<Contact | null> {
	const supabase = createClient();

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
		throw error;
	}

	return data;
}

export function useContact(id: string) {
	return useQuery({
		queryKey: contactQueries.detail(id),
		queryFn: () => getContact(id),
		enabled: !!id,
	});
}

export async function getContacts(): Promise<Contact[]> {
	const supabase = createClient();

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
		.order("full_name", { ascending: true });

	if (error) {
		console.error("Error fetching contacts:", error);
		throw error;
	}

	return data || [];
}

export function useContacts() {
	return useQuery({
		queryKey: contactQueries.list(),
		queryFn: () => getContacts(),
	});
}
