import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import TeamMembersContent from "@/features/team-members/components/team-members.content";
import TeamMembersHeader from "@/features/team-members/layout/team-members.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import TeamMembersLoading from "./loading";

export default function TeamMembersPage() {
	return (
		<Suspense fallback={<TeamMembersLoading />}>
			<TeamMembersPageAsync />
		</Suspense>
	);
}

async function TeamMembersPageAsync() {
	const queryClient = new QueryClient();

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// TODO: Add data prefetching here when implementing actual queries
	// await Promise.all([
	//   queryClient.prefetchQuery(teamMembersQueries.query1()),
	//   queryClient.prefetchQuery(teamMembersQueries.query2()),
	// ]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<TeamMembersHeader key="team-members-header" />]}>
				<TeamMembersContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
