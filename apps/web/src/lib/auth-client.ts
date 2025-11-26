import { ac, admin, user } from "@/lib/permissions";

import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/client";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [
		emailOTPClient(),
		passkeyClient(),

		adminClient({
			ac,
			roles: {
				admin,
				user,
			},
		}),
	],
});
