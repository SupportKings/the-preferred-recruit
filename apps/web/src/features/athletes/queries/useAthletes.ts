"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import {
	getAthleteStatusCategories,
	getAthleteStatusValues,
} from "@/features/athletes/actions/athleteStatuses";
import {
	getAllAthletes,
	getAthlete,
	getAthletesFaceted,
	getAthletesWithFaceted,
	getAthletesWithFilters,
} from "@/features/athletes/actions/getAthletes";
import { getTeamMembers } from "@/features/athletes/actions/getTeamMembers";

import { useQuery, type useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const athleteQueries = {
	all: ["athletes"] as const,
	lists: () => [...athleteQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...athleteQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...athleteQueries.lists(),
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
			...athleteQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...athleteQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...athleteQueries.all, "detail"] as const,
	detail: (id: string) => [...athleteQueries.details(), id] as const,
};

// Query hooks
export function useAthletes() {
	return useQuery({
		queryKey: athleteQueries.lists(),
		queryFn: getAllAthletes,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useAthletesTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: athleteQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getAthletesWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useAthletesFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: athleteQueries.faceted(columnId, filters),
		queryFn: () => getAthletesFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useAthletesWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = [],
) {
	return useQuery({
		queryKey: athleteQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getAthletesWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useAthlete(id: string) {
	return useQuery({
		queryKey: athleteQueries.detail(id),
		queryFn: () => getAthlete(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Prefetch helpers
export function prefetchAthletes(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: athleteQueries.lists(),
		queryFn: getAllAthletes,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchAthlete(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: athleteQueries.detail(id),
		queryFn: () => getAthlete(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchAthletesTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: athleteQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getAthletesWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchAthletesFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: athleteQueries.faceted(columnId, filters),
		queryFn: () => getAthletesFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}

// Team members query for lookup fields
export function useTeamMembers() {
	return useQuery({
		queryKey: ["team_members"],
		queryFn: getTeamMembers,
		staleTime: 10 * 60 * 1000, // 10 minutes (team members don't change often)
	});
}

// Status query keys
export const athleteStatusQueries = {
	all: ["athlete_statuses"] as const,
	categories: () => [...athleteStatusQueries.all, "categories"] as const,
	values: (athleteId: string) =>
		[...athleteStatusQueries.all, "values", athleteId] as const,
};

// Status categories hook (all categories and options for athletes)
export function useAthleteStatusCategories() {
	return useQuery({
		queryKey: athleteStatusQueries.categories(),
		queryFn: getAthleteStatusCategories,
		staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
	});
}

// Status values hook for a specific athlete
export function useAthleteStatusValues(athleteId: string) {
	return useQuery({
		queryKey: athleteStatusQueries.values(athleteId),
		queryFn: () => getAthleteStatusValues(athleteId),
		enabled: !!athleteId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}
