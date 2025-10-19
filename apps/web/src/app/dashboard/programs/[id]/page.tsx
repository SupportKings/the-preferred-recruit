import { Suspense } from "react";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getProgram } from "@/features/programs/actions/getProgram";
import ProgramDetailSkeleton from "@/features/programs/components/program.detail.skeleton";
import ProgramDetailView from "@/features/programs/components/program.detail.view";
import ProgramDetailHeader from "@/features/programs/layout/program.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ProgramDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export const metadata: Metadata = {
	title: "Program Details",
	description: "View and manage program information",
};

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
	return (
		<Suspense fallback={<ProgramDetailSkeleton programId="" />}>
			<ProgramDetailPageAsync params={params} />
		</Suspense>
	);
}

async function ProgramDetailPageAsync({ params }: ProgramDetailPageProps) {
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

	// Prefetch the program data
	await queryClient.prefetchQuery({
		queryKey: ["programs", "detail", id],
		queryFn: () => getProgram(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ProgramDetailHeader key="program-detail-header" programId={id} />,
				]}
			>
				<ProgramDetailView programId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
