"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// Export Better Auth types for users
export type ListUsersResponse = Awaited<ReturnType<typeof auth.api.listUsers>>;
export type UserWithRole = ListUsersResponse["users"][0];

// Default function - excludes banned users (most common case)
export const getUsers = async (): Promise<ListUsersResponse> => {
	const users = await auth.api.listUsers({
		query: {
			sortBy: "name",
			sortDirection: "desc",
		},
		headers: await headers(),
	});

	// Filter out banned users
	if (users.users) {
		users.users = users.users.filter((user) => user.banned !== true);
		users.total = users.users.length;
	}

	return users;
};

// Rare case - includes banned users
export const getAllUsers = async (): Promise<ListUsersResponse> => {
	return await auth.api.listUsers({
		query: {
			sortBy: "name",
			sortDirection: "desc",
		},
		headers: await headers(),
	});
};
