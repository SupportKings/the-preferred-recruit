import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { getTeamMembers } from "@/features/athletes/actions/getTeamMembers";
import { AthleteForm } from "@/features/athletes/components/athlete.form";
import AthletesAddSkeleton from "@/features/athletes/components/athletes.add.skeleton";
import AthletesAddHeader from "@/features/athletes/layout/athletes.add.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function AthletesAddPage() {
	return (
		<Suspense fallback={<AthletesAddSkeleton />}>
			<AthletesAddPageAsync />
		</Suspense>
	);
}

async function AthletesAddPageAsync() {
	const queryClient = new QueryClient();

	// Prefetch team members for lookup fields
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["team_members"],
			queryFn: getTeamMembers,
			staleTime: 10 * 60 * 1000,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<AthletesAddHeader key="athletes-add-header" />]}>
				<div className="p-6">
					<AthleteForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
