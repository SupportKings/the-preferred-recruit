import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getUniversity } from "@/features/universities/actions/getUniversity";
import UniversityDetailSkeleton from "@/features/universities/components/university.detail.skeleton";
import UniversityDetailView from "@/features/universities/components/university.detail.view";
import UniversityDetailHeader from "@/features/universities/layout/university.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface UniversityDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function UniversityDetailPage({
	params,
}: UniversityDetailPageProps) {
	return (
		<Suspense fallback={<UniversityDetailSkeleton universityId="" />}>
			<UniversityDetailPageAsync params={params} />
		</Suspense>
	);
}

async function UniversityDetailPageAsync({
	params,
}: UniversityDetailPageProps) {
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

	// Prefetch the university data
	await queryClient.prefetchQuery({
		queryKey: ["universities", "detail", id],
		queryFn: () => getUniversity(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<UniversityDetailHeader
						key="university-detail-header"
						universityId={id}
					/>,
				]}
			>
				<UniversityDetailView universityId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
