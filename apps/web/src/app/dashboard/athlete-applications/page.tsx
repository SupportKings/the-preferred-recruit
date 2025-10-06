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

	// TODO: Add data prefetching here when implementing actual queries
	// await Promise.all([
	//   queryClient.prefetchQuery(athleteApplicationsQueries.query1()),
	//   queryClient.prefetchQuery(athleteApplicationsQueries.query2()),
	// ]);

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
