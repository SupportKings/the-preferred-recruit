"use client";

import { useQuery } from "@tanstack/react-query";
import { getPasskeys } from "./getPasskeys";

export const usePasskeys = () => {
	return useQuery({
		queryKey: ["passkeys"],
		queryFn: getPasskeys,
	});
};
