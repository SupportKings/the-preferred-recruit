import { useQuery } from "@tanstack/react-query";

import { getUniversityJob } from "../actions/getUniversityJob";

export const universityJobQueries = {
	all: ["university-jobs"] as const,
	detail: (id: string) => [...universityJobQueries.all, "detail", id] as const,
};

export function useUniversityJob(universityJobId: string) {
	return useQuery({
		queryKey: universityJobQueries.detail(universityJobId),
		queryFn: () => getUniversityJob(universityJobId),
		enabled: !!universityJobId,
	});
}
