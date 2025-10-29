import { useQuery } from "@tanstack/react-query";
import { getAllPrograms, getProgram } from "../actions/getProgram";

export const programQueries = {
	all: ["programs"] as const,
	lists: () => [...programQueries.all, "list"] as const,
	detail: (programId: string) => ["programs", "detail", programId] as const,
};

export function usePrograms() {
	return useQuery({
		queryKey: programQueries.lists(),
		queryFn: getAllPrograms,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useProgram(programId: string) {
	return useQuery({
		queryKey: programQueries.detail(programId),
		queryFn: () => getProgram(programId),
		enabled: !!programId,
	});
}
