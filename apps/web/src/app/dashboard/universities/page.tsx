import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import UniversitiesContent from "@/features/universities/components/universities-content";
import UniversitiesHeader from "@/features/universities/layout/universities-header";

import { getUser } from "@/queries/getUser";

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

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// TODO: Add data prefetching here when implementing actual queries
	// await Promise.all([
	//   queryClient.prefetchQuery(universitiesQueries.query1()),
	//   queryClient.prefetchQuery(universitiesQueries.query2()),
	// ]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<UniversitiesHeader key="universities-header" />]}>
				<UniversitiesContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
