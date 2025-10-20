import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
	handleServerError(error) {
		console.error("Safe action server error:", {
			error,
			message: error.message,
			stack: error.stack,
			name: error.name,
		});

		// Return the actual error message instead of generic one
		if (error instanceof Error) {
			return error.message;
		}

		return "Something went wrong while executing the operation.";
	},
});
