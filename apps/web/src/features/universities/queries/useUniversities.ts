"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import {
	getAllUniversities,
	getUniversitiesFaceted,
	getUniversitiesWithFaceted,
	getUniversitiesWithFilters,
	getUniversity,
} from "@/features/universities/actions/getUniversity";

import { useQuery, type useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const universityQueries = {
	all: ["universities"] as const,
	lists: () => [...universityQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...universityQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...universityQueries.lists(),
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
			...universityQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...universityQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...universityQueries.all, "detail"] as const,
	detail: (id: string) => [...universityQueries.details(), id] as const,
};

// Query hooks
export function useUniversities() {
	return useQuery({
		queryKey: universityQueries.lists(),
		queryFn: getAllUniversities,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useUniversitiesTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: universityQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getUniversitiesWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useUniversitiesFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: universityQueries.faceted(columnId, filters),
		queryFn: () => getUniversitiesFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useUniversitiesWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["state", "type_public_private", "email_blocked"],
) {
	return useQuery({
		queryKey: universityQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getUniversitiesWithFaceted(
				filters,
				page,
				pageSize,
				sorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useUniversity(id: string) {
	return useQuery({
		queryKey: universityQueries.detail(id),
		queryFn: () => getUniversity(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Prefetch helpers
export function prefetchUniversities(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: universityQueries.lists(),
		queryFn: getAllUniversities,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchUniversity(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: universityQueries.detail(id),
		queryFn: () => getUniversity(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchUniversitiesTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: universityQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getUniversitiesWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchUniversitiesFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: universityQueries.faceted(columnId, filters),
		queryFn: () => getUniversitiesFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
