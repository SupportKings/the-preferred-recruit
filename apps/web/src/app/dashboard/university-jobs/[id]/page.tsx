import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getUniversityJob } from "@/features/university-jobs/actions/getUniversityJob";
import UniversityJobDetailSkeleton from "@/features/university-jobs/components/university-job.detail.skeleton";
import UniversityJobDetailView from "@/features/university-jobs/components/university-job.detail.view";
import UniversityJobDetailHeader from "@/features/university-jobs/layout/university-job.detail.header";

import { getUser } from "@/queries/getUser";

import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from "@tanstack/react-query";

interface UniversityJobDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function UniversityJobDetailPage({
	params,
}: UniversityJobDetailPageProps) {
	return (
		<Suspense fallback={<UniversityJobDetailSkeleton universityJobId="" />}>
			<UniversityJobDetailPageAsync params={params} />
		</Suspense>
	);
}

async function UniversityJobDetailPageAsync({
	params,
}: UniversityJobDetailPageProps) {
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

	// Prefetch the university job data
	await queryClient.prefetchQuery({
		queryKey: ["university-jobs", "detail", id],
		queryFn: () => getUniversityJob(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<UniversityJobDetailHeader
						key="university-job-detail-header"
						universityJobId={id}
					/>,
				]}
			>
				<UniversityJobDetailView universityJobId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
