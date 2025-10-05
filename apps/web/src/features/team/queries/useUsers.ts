import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUsers } from "./getUsers";

// React Query hook for client-side usage
export const useUsers = (includeBanned = false) =>
	useQuery({
		queryKey: ["users", includeBanned],
		queryFn: includeBanned ? getAllUsers : getUsers,
	});
