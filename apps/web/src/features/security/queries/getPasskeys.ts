"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// Export Better Auth types for passkeys
export type ListPasskeysResponse = Awaited<
	ReturnType<typeof auth.api.listPasskeys>
>;
export type Passkey = ListPasskeysResponse[0];

// Server action to get passkeys
export const getPasskeys = async (): Promise<ListPasskeysResponse> => {
	const passkeys = await auth.api.listPasskeys({
		// This endpoint requires session cookies.
		headers: await headers(),
	});
	return passkeys || [];
};
