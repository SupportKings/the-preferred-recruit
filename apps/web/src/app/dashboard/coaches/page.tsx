import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import CoachesContent from "@/features/coaches/components/coaches-content";
import CoachesHeader from "@/features/coaches/layout/coaches-header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import CoachesLoading from "./loading";

export default function CoachesPage() {
	return (
		<Suspense fallback={<CoachesLoading />}>
			<CoachesPageAsync />
		</Suspense>
	);
}

async function CoachesPageAsync() {
	const queryClient = new QueryClient();

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// TODO: Add data prefetching here when implementing actual queries
	// await Promise.all([
	//   queryClient.prefetchQuery(coachesQueries.query1()),
	//   queryClient.prefetchQuery(coachesQueries.query2()),
	// ]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<CoachesHeader key="coaches-header" />]}>
				<CoachesContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
