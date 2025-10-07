import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import TeamMemberAddSkeleton from "@/features/team-members/components/team-member.add.skeleton";
import { TeamMemberForm } from "@/features/team-members/components/team-member.form";
import TeamMemberAddHeader from "@/features/team-members/layout/team-member.add.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function TeamMembersAddPage() {
	return (
		<Suspense fallback={<TeamMemberAddSkeleton />}>
			<TeamMembersAddPageAsync />
		</Suspense>
	);
}

async function TeamMembersAddPageAsync() {
	const queryClient = new QueryClient();

	// No prefetching needed for team members create form
	// as it only has basic text fields

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[<TeamMemberAddHeader key="team-member-add-header" />]}
			>
				<div className="p-6">
					<TeamMemberForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
