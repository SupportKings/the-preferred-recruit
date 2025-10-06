"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import {
	getAllTeamMembers,
	getTeamMember,
	getTeamMembersFaceted,
	getTeamMembersWithFaceted,
	getTeamMembersWithFilters,
	getUsers,
} from "@/features/team-members/actions/getTeamMembers";

import { useQuery, type useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const teamMemberQueries = {
	all: ["team-members"] as const,
	lists: () => [...teamMemberQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...teamMemberQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...teamMemberQueries.lists(),
			"table",
			filters,
			page,
			pageSize,
			sorting,
		] as const,
	tableDataWithFaceted: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
		facetedColumns: string[],
	) =>
		[
			...teamMemberQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...teamMemberQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...teamMemberQueries.all, "detail"] as const,
	detail: (id: string) => [...teamMemberQueries.details(), id] as const,
};

// Query hooks
export function useTeamMembers() {
	return useQuery({
		queryKey: teamMemberQueries.lists(),
		queryFn: getAllTeamMembers,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useTeamMembersTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: teamMemberQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getTeamMembersWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useTeamMembersFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: teamMemberQueries.faceted(columnId, filters),
		queryFn: () => getTeamMembersFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Users query for filter options
export function useUsers() {
	return useQuery({
		queryKey: ["users"],
		queryFn: getUsers,
		staleTime: 10 * 60 * 1000, // 10 minutes (users don't change often)
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useTeamMembersWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["user_id"],
) {
	return useQuery({
		queryKey: teamMemberQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getTeamMembersWithFaceted(
				filters,
				page,
				pageSize,
				sorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useTeamMember(id: string) {
	return useQuery({
		queryKey: teamMemberQueries.detail(id),
		queryFn: () => getTeamMember(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Prefetch helpers
export function prefetchTeamMembers(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: teamMemberQueries.lists(),
		queryFn: getAllTeamMembers,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchTeamMember(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: teamMemberQueries.detail(id),
		queryFn: () => getTeamMember(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchTeamMembersTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: teamMemberQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getTeamMembersWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchTeamMembersFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: teamMemberQueries.faceted(columnId, filters),
		queryFn: () => getTeamMembersFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
