"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// Export Better Auth types for sessions
export type ListSessionsResponse = Awaited<
	ReturnType<typeof auth.api.listSessions>
>;
export type Session = ListSessionsResponse[0];

// Server action to get sessions
export const getSessions = async (): Promise<ListSessionsResponse> => {
	const sessions = await auth.api.listSessions({
		headers: await headers(),
	});
	return sessions;
};
