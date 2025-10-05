import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import TeamHeader from "@/features/team/layout/team-header";
import { getUsers } from "@/features/team/queries/getUsers";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import TeamClient from "./team-client";

export default async function TeamPage() {
	const queryClient = new QueryClient();

	// Get current user session
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	await queryClient.prefetchQuery({
		queryKey: ["users", false],
		queryFn: getUsers,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<TeamHeader key="team-header" />]}>
				<TeamClient currentUserId={session.session.userId} />
			</MainLayout>
		</HydrationBoundary>
	);
}
