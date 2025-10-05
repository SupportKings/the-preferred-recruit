import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import {
	getBillingStatuses,
	getOnboardingStatuses,
	prefetchClientsWithFacetedServer,
} from "@/features/clients/actions/getClient";
import ClientsContent from "@/features/clients/components/clients.content";
import ClientsHeader from "@/features/clients/layout/clients.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import ClientsLoading from "./loading";

export default function ClientsPage() {
	return (
		<Suspense fallback={<ClientsLoading />}>
			<ClientsPageAsync />
		</Suspense>
	);
}

async function ClientsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["billing_status_id", "onboarding_status_id"];
	const combinedDataKey = [
		"clients",
		"list",
		"tableWithFaceted",
		defaultFilters,
		0,
		25,
		defaultSorting,
		facetedColumns,
	];
	const billingStatusesKey = ["billing_statuses"];
	const onboardingStatusesKey = ["onboarding_statuses"];

	// Prefetch optimized combined data and statuses using server-side functions
	await Promise.all([
		// Prefetch combined clients + faceted data (single optimized call)
		queryClient.prefetchQuery({
			queryKey: combinedDataKey,
			queryFn: () =>
				prefetchClientsWithFacetedServer(
					defaultFilters,
					0,
					25,
					defaultSorting,
					facetedColumns,
				),
			staleTime: 2 * 60 * 1000,
		}),
		// Prefetch billing statuses for filter options
		queryClient.prefetchQuery({
			queryKey: billingStatusesKey,
			queryFn: () => getBillingStatuses(),
			staleTime: 10 * 60 * 1000,
		}),
		// Prefetch onboarding statuses for filter options
		queryClient.prefetchQuery({
			queryKey: onboardingStatusesKey,
			queryFn: () => getOnboardingStatuses(),
			staleTime: 10 * 60 * 1000,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<ClientsHeader key="clients-header" />]}>
				<ClientsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
