import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

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

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<AthletesHeader key="athletes-header" />]}>
				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<h1 className="text-3xl">Athletes</h1>
						<p className="text-lg text-muted-foreground">
							Manage and track athlete profiles and progress.
						</p>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">Coming Soon</h2>
						<p className="text-muted-foreground">
							Athletes management features will be available here.
						</p>
					</div>
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
