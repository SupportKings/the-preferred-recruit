import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getSchoolLeadList } from "@/features/school-lead-lists/actions/getSchoolLeadList";
import SchoolLeadListDetailSkeleton from "@/features/school-lead-lists/components/school-lead-list.detail.skeleton";
import SchoolLeadListDetailView from "@/features/school-lead-lists/components/school-lead-list.detail.view";
import SchoolLeadListDetailHeader from "@/features/school-lead-lists/layout/school-lead-list.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface SchoolLeadListDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function SchoolLeadListDetailPage({
	params,
}: SchoolLeadListDetailPageProps) {
	return (
		<Suspense fallback={<SchoolLeadListDetailSkeleton leadListId="" />}>
			<SchoolLeadListDetailPageAsync params={params} />
		</Suspense>
	);
}

async function SchoolLeadListDetailPageAsync({
	params,
}: SchoolLeadListDetailPageProps) {
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

	// Prefetch the lead list data
	await queryClient.prefetchQuery({
		queryKey: ["schoolLeadLists", "detail", id],
		queryFn: () => getSchoolLeadList(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<SchoolLeadListDetailHeader
						key="school-lead-list-detail-header"
						leadListId={id}
					/>,
				]}
			>
				<SchoolLeadListDetailView leadListId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
