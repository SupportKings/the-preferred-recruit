"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	revokeAllOtherSessions,
	revokeSession,
} from "../actions/revokeSession";

export const useSessionMutations = () => {
	const queryClient = useQueryClient();

	const revokeSessionMutation = useMutation({
		mutationFn: async (sessionToken: string) => {
			const result = await revokeSession({ sessionToken });
			if (result?.validationErrors || result?.serverError) {
				throw new Error(result.serverError || "Failed to revoke session");
			}
			return result;
		},
		onSuccess: () => {
			// Invalidate and refetch sessions
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});

	const revokeAllSessionsMutation = useMutation({
		mutationFn: async () => {
			const result = await revokeAllOtherSessions();
			if (result?.serverError) {
				throw new Error(result.serverError);
			}
			return result;
		},
		onSuccess: () => {
			// Invalidate and refetch sessions
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});

	return {
		revokeSession: revokeSessionMutation,
		revokeAllSessions: revokeAllSessionsMutation,
	};
};
