import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import TeamMembersHeader from "@/features/team-members/layout/team-members-header";

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

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<TeamMembersHeader key="team-members-header" />]}>
				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<h1 className="text-3xl">Team Members</h1>
						<p className="text-lg text-muted-foreground">
							Manage team members and their roles.
						</p>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">Coming Soon</h2>
						<p className="text-muted-foreground">
							Team member management features will be available here.
						</p>
					</div>
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
