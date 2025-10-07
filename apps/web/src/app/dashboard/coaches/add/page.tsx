import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { CoachForm } from "@/features/coaches/components/coach-form";
import CoachesAddSkeleton from "@/features/coaches/components/coaches.add.skeleton";
import CoachesAddHeader from "@/features/coaches/layout/coaches.add.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function CoachesAddPage() {
	return (
		<Suspense fallback={<CoachesAddSkeleton />}>
			<CoachesAddPageAsync />
		</Suspense>
	);
}

async function CoachesAddPageAsync() {
	const queryClient = new QueryClient();

	// No related data to prefetch for coaches form

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<CoachesAddHeader key="coaches-add-header" />]}>
				<div className="p-6">
					<CoachForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
