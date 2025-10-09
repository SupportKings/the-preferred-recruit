import { useQuery } from "@tanstack/react-query";
import { getProgram } from "../actions/getProgram";

export const programQueries = {
	detail: (programId: string) => ["programs", "detail", programId] as const,
};

export function useProgram(programId: string) {
	return useQuery({
		queryKey: programQueries.detail(programId),
		queryFn: () => getProgram(programId),
		enabled: !!programId,
	});
}
