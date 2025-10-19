import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getTeamMember } from "@/features/team-members/actions/getTeamMembers";
import TeamMemberDetailSkeleton from "@/features/team-members/components/team-member.detail.skeleton";
import TeamMemberDetailView from "@/features/team-members/components/team-member.detail.view";
import TeamMemberDetailHeader from "@/features/team-members/layout/team-member.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface TeamMemberDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function TeamMemberDetailPage({
	params,
}: TeamMemberDetailPageProps) {
	return (
		<Suspense fallback={<TeamMemberDetailSkeleton teamMemberId="" />}>
			<TeamMemberDetailPageAsync params={params} />
		</Suspense>
	);
}

async function TeamMemberDetailPageAsync({
	params,
}: TeamMemberDetailPageProps) {
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

	// Prefetch the team member data
	await queryClient.prefetchQuery({
		queryKey: ["team-members", "detail", id],
		queryFn: () => getTeamMember(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<TeamMemberDetailHeader
						key="team-member-detail-header"
						teamMemberId={id}
					/>,
				]}
			>
				<TeamMemberDetailView teamMemberId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
