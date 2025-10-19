import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getCoach } from "@/features/coaches/actions/getCoach";
import CoachDetailSkeleton from "@/features/coaches/components/coach.detail.skeleton";
import CoachDetailView from "@/features/coaches/components/coach.detail.view";
import CoachDetailHeader from "@/features/coaches/layout/coach.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface CoachDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function CoachDetailPage({ params }: CoachDetailPageProps) {
	return (
		<Suspense fallback={<CoachDetailSkeleton coachId="" />}>
			<CoachDetailPageAsync params={params} />
		</Suspense>
	);
}

async function CoachDetailPageAsync({ params }: CoachDetailPageProps) {
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

	// Prefetch the coach data
	await queryClient.prefetchQuery({
		queryKey: ["coaches", "detail", id],
		queryFn: () => getCoach(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[<CoachDetailHeader key="coach-detail-header" coachId={id} />]}
			>
				<CoachDetailView coachId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
