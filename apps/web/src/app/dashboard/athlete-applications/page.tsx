import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

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

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[<AthleteApplicationsHeader key="athlete-applications-header" />]}
			>
				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<h1 className="text-3xl">Athlete Applications</h1>
						<p className="text-lg text-muted-foreground">
							Review and manage athlete applications.
						</p>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">Coming Soon</h2>
						<p className="text-muted-foreground">
							Athlete applications management features will be available here.
						</p>
					</div>
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
