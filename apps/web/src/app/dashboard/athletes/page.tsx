import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchAthletesWithFacetedServer } from "@/features/athletes/actions/getAthletes";
import AthletesContent from "@/features/athletes/components/athletes.content";
import AthletesHeader from "@/features/athletes/layout/athletes.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import AthletesLoading from "./loading";

export default function AthletesPage() {
	return (
		<Suspense fallback={<AthletesLoading />}>
			<AthletesPageAsync />
		</Suspense>
	);
}

async function AthletesPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns: string[] = [];
	const combinedDataKey = [
		"athletes",
		"list",
		"tableWithFaceted",
		defaultFilters,
		0,
		25,
		defaultSorting,
		facetedColumns,
	];

	// Prefetch optimized combined data
	await Promise.all([
		// Prefetch combined athletes + faceted data (single optimized call)
		queryClient.prefetchQuery({
			queryKey: combinedDataKey,
			queryFn: () =>
				prefetchAthletesWithFacetedServer(
					defaultFilters,
					0,
					25,
					defaultSorting,
					facetedColumns,
				),
			staleTime: 2 * 60 * 1000,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<AthletesHeader key="athletes-header" />]}>
				<AthletesContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
