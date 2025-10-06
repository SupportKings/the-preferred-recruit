import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import AthletesContent from "@/features/athletes/components/athletes-content";
import AthletesHeader from "@/features/athletes/layout/athletes-header";

import { getUser } from "@/queries/getUser";

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

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// TODO: Add data prefetching here when implementing actual queries
	// await Promise.all([
	//   queryClient.prefetchQuery(athletesQueries.query1()),
	//   queryClient.prefetchQuery(athletesQueries.query2()),
	// ]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<AthletesHeader key="athletes-header" />]}>
				<AthletesContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
