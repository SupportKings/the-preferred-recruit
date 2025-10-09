import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getAthlete } from "@/features/athletes/actions/getAthletes";
import AthleteDetailSkeleton from "@/features/athletes/components/athlete.detail.skeleton";
import AthleteDetailView from "@/features/athletes/components/athlete.detail.view";
import AthleteDetailHeader from "@/features/athletes/layout/athlete.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface AthleteDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function AthleteDetailPage({ params }: AthleteDetailPageProps) {
	return (
		<Suspense fallback={<AthleteDetailSkeleton athleteId="" />}>
			<AthleteDetailPageAsync params={params} />
		</Suspense>
	);
}

async function AthleteDetailPageAsync({ params }: AthleteDetailPageProps) {
	const { id } = await params;

	// Validate that id is provided
	if (!id) {
		notFound();
	}

	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Prefetch the athlete data
	await queryClient.prefetchQuery({
		queryKey: ["athletes", "detail", id],
		queryFn: () => getAthlete(id),
	});

	// Get the prefetched data to check if athlete exists
	const athlete = queryClient.getQueryData<any>(["athletes", "detail", id]);

	if (!athlete) {
		notFound();
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<AthleteDetailHeader key="athlete-detail-header" athleteId={id} />,
				]}
			>
				<AthleteDetailView athleteId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
