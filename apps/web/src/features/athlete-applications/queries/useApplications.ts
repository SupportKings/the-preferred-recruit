"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import {
	getAllApplications,
	getApplication,
	getApplicationsFaceted,
	getApplicationsWithFaceted,
	getApplicationsWithFilters,
	getAthletes,
	getPrograms,
	getUniversities,
} from "@/features/athlete-applications/actions/getApplications";

import { useQuery, type useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const applicationQueries = {
	all: ["applications"] as const,
	lists: () => [...applicationQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...applicationQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...applicationQueries.lists(),
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
			...applicationQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...applicationQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...applicationQueries.all, "detail"] as const,
	detail: (id: string) => [...applicationQueries.details(), id] as const,
};

// Query hooks
export function useApplications() {
	return useQuery({
		queryKey: applicationQueries.lists(),
		queryFn: getAllApplications,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useApplicationsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: applicationQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getApplicationsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useApplicationsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: applicationQueries.faceted(columnId, filters),
		queryFn: () => getApplicationsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Athletes query for filter options
export function useAthletes() {
	return useQuery({
		queryKey: ["athletes"],
		queryFn: getAthletes,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

// Universities query for filter options
export function useUniversities() {
	return useQuery({
		queryKey: ["universities"],
		queryFn: getUniversities,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

// Programs query for filter options
export function usePrograms() {
	return useQuery({
		queryKey: ["programs"],
		queryFn: getPrograms,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useApplicationsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = [
		"athlete_id",
		"university_id",
		"program_id",
		"stage",
	],
) {
	return useQuery({
		queryKey: applicationQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getApplicationsWithFaceted(
				filters,
				page,
				pageSize,
				sorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useApplication(id: string) {
	return useQuery({
		queryKey: applicationQueries.detail(id),
		queryFn: () => getApplication(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Prefetch helpers
export function prefetchApplications(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: applicationQueries.lists(),
		queryFn: getAllApplications,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchApplication(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: applicationQueries.detail(id),
		queryFn: () => getApplication(id),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchApplicationsTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: applicationQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getApplicationsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchApplicationsFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: applicationQueries.faceted(columnId, filters),
		queryFn: () => getApplicationsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
