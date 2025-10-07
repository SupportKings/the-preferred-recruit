import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchUniversitiesWithFacetedServer } from "@/features/universities/actions/getUniversity";
import UniversitiesContent from "@/features/universities/components/universities-content";
import UniversitiesHeader from "@/features/universities/layout/universities-header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import UniversitiesLoading from "./loading";

export default function UniversitiesPage() {
	return (
		<Suspense fallback={<UniversitiesLoading />}>
			<UniversitiesPageAsync />
		</Suspense>
	);
}

async function UniversitiesPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["state", "type_public_private", "email_blocked"];
	const combinedDataKey = [
		"universities",
		"list",
		"tableWithFaceted",
		defaultFilters,
		0,
		25,
		defaultSorting,
		facetedColumns,
	];

	// Prefetch optimized combined data using server-side functions
	await queryClient.prefetchQuery({
		queryKey: combinedDataKey,
		queryFn: () =>
			prefetchUniversitiesWithFacetedServer(
				defaultFilters,
				0,
				25,
				defaultSorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<UniversitiesHeader key="universities-header" />]}>
				<UniversitiesContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
