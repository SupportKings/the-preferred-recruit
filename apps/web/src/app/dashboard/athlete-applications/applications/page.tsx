import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import {
	getAthletes,
	getPrograms,
	getUniversities,
	prefetchApplicationsWithFacetedServer,
} from "@/features/athlete-applications/actions/getApplications";
import { ApplicationsContent } from "@/features/athlete-applications/components/applications.content";
import ApplicationsHeader from "@/features/athlete-applications/layout/applications.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function ApplicationsPage() {
	return (
		<Suspense fallback={<ApplicationsLoading />}>
			<ApplicationsPageAsync />
		</Suspense>
	);
}

function ApplicationsLoading() {
	return (
		<MainLayout headers={[<ApplicationsHeader key="applications-header" />]}>
			<div className="space-y-6 p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-10 w-64 rounded bg-muted" />
					<div className="h-96 w-full rounded bg-muted" />
				</div>
			</div>
		</MainLayout>
	);
}

async function ApplicationsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["athlete_id", "university_id", "program_id", "stage"];
	const combinedDataKey = [
		"applications",
		"list",
		"tableWithFaceted",
		defaultFilters,
		0,
		25,
		defaultSorting,
		facetedColumns,
	];
	const athletesKey = ["athletes"];
	const universitiesKey = ["universities"];
	const programsKey = ["programs"];

	// Prefetch optimized combined data and reference data using server-side functions
	await Promise.all([
		// Prefetch combined applications + faceted data (single optimized call)
		queryClient.prefetchQuery({
			queryKey: combinedDataKey,
			queryFn: () =>
				prefetchApplicationsWithFacetedServer(
					defaultFilters,
					0,
					25,
					defaultSorting,
					facetedColumns,
				),
			staleTime: 2 * 60 * 1000,
		}),
		// Prefetch athletes for filter options
		queryClient.prefetchQuery({
			queryKey: athletesKey,
			queryFn: () => getAthletes(),
			staleTime: 10 * 60 * 1000,
		}),
		// Prefetch universities for filter options
		queryClient.prefetchQuery({
			queryKey: universitiesKey,
			queryFn: () => getUniversities(),
			staleTime: 10 * 60 * 1000,
		}),
		// Prefetch programs for filter options
		queryClient.prefetchQuery({
			queryKey: programsKey,
			queryFn: () => getPrograms(),
			staleTime: 10 * 60 * 1000,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<ApplicationsHeader key="applications-header" />]}>
				<ApplicationsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
