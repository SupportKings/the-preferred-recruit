// Simple permissions configuration for Better Auth admin plugin
// This provides minimal access control without complex role-based permissions

import { createAccessControl } from "better-auth/plugins/access";

// Create a simple access control that allows all admin operations
export const ac = createAccessControl({
	user: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"ban",
		"unban",
		"impersonate",
		"set-role",
	],
});

// Simple role definitions - all users get basic access
export const user = ac.newRole({
	user: ["read"],
});

// Admin role with all permissions
export const admin = ac.newRole({
	user: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"ban",
		"unban",
		"impersonate",
		"set-role",
	],
});
