import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { AthleteApplicationForm } from "@/features/athlete-applications/components/athlete-application-form";
import AthleteApplicationsAddSkeleton from "@/features/athlete-applications/components/athlete-applications.add.skeleton";
import AthleteApplicationsAddHeader from "@/features/athlete-applications/layout/athlete-applications.add.header";
import { getAllAthletes } from "@/features/athletes/actions/getAthletes";
import { getAllUniversities } from "@/features/universities/actions/getUniversity";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function AthleteApplicationsAddPage() {
	return (
		<Suspense fallback={<AthleteApplicationsAddSkeleton />}>
			<AthleteApplicationsAddPageAsync />
		</Suspense>
	);
}

async function AthleteApplicationsAddPageAsync() {
	const queryClient = new QueryClient();

	// Prefetch athletes and universities for lookup fields
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["athletes"],
			queryFn: getAllAthletes,
			staleTime: 5 * 60 * 1000,
		}),
		queryClient.prefetchQuery({
			queryKey: ["universities"],
			queryFn: getAllUniversities,
			staleTime: 5 * 60 * 1000,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<AthleteApplicationsAddHeader key="athlete-applications-add-header" />,
				]}
			>
				<div className="p-6">
					<AthleteApplicationForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
