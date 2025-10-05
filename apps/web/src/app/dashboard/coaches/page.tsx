import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

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

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<CoachesHeader key="coaches-header" />]}>
				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<h1 className="text-3xl">Coaches</h1>
						<p className="text-lg text-muted-foreground">
							Manage coach profiles and connections.
						</p>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">Coming Soon</h2>
						<p className="text-muted-foreground">
							Coach directory features will be available here.
						</p>
					</div>
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
