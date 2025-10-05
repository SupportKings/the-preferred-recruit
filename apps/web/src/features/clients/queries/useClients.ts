"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { createClientAction } from "@/features/clients/actions/createClient";
import { deleteClient } from "@/features/clients/actions/deleteClient";
import {
	getAllClients,
	getBillingStatuses,
	getClient,
	getClientsFaceted,
	getClientsWithFaceted,
	getClientsWithFilters,
	getOnboardingStatuses,
} from "@/features/clients/actions/getClient";
import { updateClientAction } from "@/features/clients/actions/updateClient";
import type {
	ClientEditFormInput,
	ClientFormInput,
} from "@/features/clients/types/client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";

// Query keys
export const clientQueries = {
	all: ["clients"] as const,
	lists: () => [...clientQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...clientQueries.lists(), filters] as const,
	tableData: (
		filters: FiltersState,
		page: number,
		pageSize: number,
		sorting: SortingState,
	) =>
		[
			...clientQueries.lists(),
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
			...clientQueries.lists(),
			"tableWithFaceted",
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		] as const,
	faceted: (columnId: string, filters: FiltersState) =>
		[...clientQueries.lists(), "faceted", columnId, filters] as const,
	details: () => [...clientQueries.all, "detail"] as const,
	detail: (id: string) => [...clientQueries.details(), id] as const,
};

// Query hooks
export function useClients() {
	return useQuery({
		queryKey: clientQueries.lists(),
		queryFn: getAllClients,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Enhanced hook for table data with filtering, pagination, sorting
export function useClientsTableData(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return useQuery({
		queryKey: clientQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getClientsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Faceted data query for filters
export function useClientsFaceted(
	columnId: string,
	filters: FiltersState = [],
) {
	return useQuery({
		queryKey: clientQueries.faceted(columnId, filters),
		queryFn: () => getClientsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Billing statuses query for filter options
export function useBillingStatuses() {
	return useQuery({
		queryKey: ["billing_statuses"],
		queryFn: getBillingStatuses,
		staleTime: 10 * 60 * 1000, // 10 minutes (statuses don't change often)
	});
}

// Onboarding statuses query for filter options
export function useOnboardingStatuses() {
	return useQuery({
		queryKey: ["onboarding_statuses"],
		queryFn: getOnboardingStatuses,
		staleTime: 10 * 60 * 1000, // 10 minutes (statuses don't change often)
	});
}

// Combined hook for table data with faceted data - optimized single call
export function useClientsWithFaceted(
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
	facetedColumns: string[] = ["billing_status_id", "onboarding_status_id"],
) {
	return useQuery({
		queryKey: clientQueries.tableDataWithFaceted(
			filters,
			page,
			pageSize,
			sorting,
			facetedColumns,
		),
		queryFn: () =>
			getClientsWithFaceted(filters, page, pageSize, sorting, facetedColumns),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useClient(id: string) {
	return useQuery({
		queryKey: clientQueries.detail(id),
		queryFn: () => getClient(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Mutation hooks
export function useCreateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientFormInput) => createClientAction(data),
		onSuccess: () => {
			// Invalidate and refetch clients list
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
		},
	});
}

export function useUpdateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientEditFormInput) => updateClientAction(data),
		onSuccess: (result, variables) => {
			// Invalidate and refetch both the list and the specific client
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
			queryClient.invalidateQueries({
				queryKey: clientQueries.detail(variables.id),
			});
		},
	});
}

export function useDeleteClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteClient({ id }),
		onSuccess: (result, deletedId) => {
			// Remove the deleted client from the cache
			queryClient.removeQueries({ queryKey: clientQueries.detail(deletedId) });

			// Invalidate the clients list to refetch
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
		},
	});
}

// Prefetch helpers
export function prefetchClients(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.lists(),
		queryFn: getAllClients,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchClient(
	queryClient: ReturnType<typeof useQueryClient>,
	id: string,
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.detail(id),
		queryFn: () => getClient(id),
		staleTime: 2 * 60 * 1000,
	});
}

// Prefetch helpers for new table data approach
export function prefetchClientsTableData(
	queryClient: ReturnType<typeof useQueryClient>,
	filters: FiltersState = [],
	page = 0,
	pageSize = 25,
	sorting: SortingState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.tableData(filters, page, pageSize, sorting),
		queryFn: () => getClientsWithFilters(filters, page, pageSize, sorting),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchClientsFaceted(
	queryClient: ReturnType<typeof useQueryClient>,
	columnId: string,
	filters: FiltersState = [],
) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.faceted(columnId, filters),
		queryFn: () => getClientsFaceted(columnId, filters),
		staleTime: 5 * 60 * 1000,
	});
}
