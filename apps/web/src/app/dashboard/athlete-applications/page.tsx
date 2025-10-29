import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import AthleteApplicationsContent from "@/features/athlete-applications/components/athlete-applications-content";
import AthleteApplicationsHeader from "@/features/athlete-applications/layout/athlete-applications-header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import AthleteApplicationsLoading from "./loading";

export default function AthleteApplicationsPage() {
	return (
		<Suspense fallback={<AthleteApplicationsLoading />}>
			<AthleteApplicationsPageAsync />
		</Suspense>
	);
}

async function AthleteApplicationsPageAsync() {
	const queryClient = new QueryClient();

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	const {
		getAthletes,
		getPrograms,
		getUniversities,
		prefetchApplicationsWithFacetedServer,
	} = await import("@/features/athlete-applications/actions/getApplications");

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
			<MainLayout
				headers={[
					<AthleteApplicationsHeader key="athlete-applications-header" />,
				]}
			>
				<AthleteApplicationsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
