import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import UniversitiesAddSkeleton from "@/features/universities/components/universities.add.skeleton";
import { UniversityForm } from "@/features/universities/components/university-form";
import UniversitiesAddHeader from "@/features/universities/layout/universities.add.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function UniversitiesAddPage() {
	return (
		<Suspense fallback={<UniversitiesAddSkeleton />}>
			<UniversitiesAddPageAsync />
		</Suspense>
	);
}

async function UniversitiesAddPageAsync() {
	const queryClient = new QueryClient();

	// No prefetching needed for universities form
	// Future: Add division/conference prefetching when those tables are implemented

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[<UniversitiesAddHeader key="universities-add-header" />]}
			>
				<div className="p-6">
					<UniversityForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
