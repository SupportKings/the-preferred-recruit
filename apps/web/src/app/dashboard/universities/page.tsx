import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

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

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<UniversitiesHeader key="universities-header" />]}>
				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<h1 className="text-3xl">Universities</h1>
						<p className="text-lg text-muted-foreground">
							Browse and manage university partnerships.
						</p>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">Coming Soon</h2>
						<p className="text-muted-foreground">
							University directory features will be available here.
						</p>
					</div>
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
