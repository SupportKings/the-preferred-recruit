"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import {
	getAllCoaches,
	getCoach,
	getCoachesFaceted,
	getCoachesWithFaceted,
	getCoachesWithFilters,
} from "@/features/coaches/actions/getCoach";

import { useQuery, type useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const coachQueries = {
	all: ["coaches"] as const,
	lists: () => [...coachQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...coachQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...coachQueries.lists(),
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
			...coachQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...coachQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...coachQueries.all, "detail"] as const,
	detail: (id: string) => [...coachQueries.details(), id] as const,
};

// Query hooks
export function useCoaches() {
	return useQuery({
		queryKey: coachQueries.lists(),
		queryFn: getAllCoaches,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useCoachesTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: coachQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getCoachesWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useCoachesFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: coachQueries.faceted(columnId, filters),
		queryFn: () => getCoachesFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useCoachesWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["primary_specialty"],
) {
	return useQuery({
		queryKey: coachQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getCoachesWithFaceted(
				filters,
				page,
				pageSize,
				sorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useCoach(id: string) {
	return useQuery({
		queryKey: coachQueries.detail(id),
		queryFn: () => getCoach(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Prefetch helpers
export function prefetchCoaches(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: coachQueries.lists(),
		queryFn: getAllCoaches,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchCoach(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: coachQueries.detail(id),
		queryFn: () => getCoach(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchCoachesTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: coachQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getCoachesWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchCoachesFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: coachQueries.faceted(columnId, filters),
		queryFn: () => getCoachesFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
