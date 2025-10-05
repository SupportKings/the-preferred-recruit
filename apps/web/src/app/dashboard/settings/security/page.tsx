import MainLayout from "@/components/layout/main-layout";

import SecurityHeader from "@/features/security/layout/security-header";
import { getPasskeys } from "@/features/security/queries/getPasskeys";
import { getSessions } from "@/features/security/queries/getSessions";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import SecurityClient from "./security-client";

export default async function SecurityPage() {
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["sessions"],
		queryFn: getSessions,
	});

	await queryClient.prefetchQuery({
		queryKey: ["passkeys"],
		queryFn: getPasskeys,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<SecurityHeader key="security-header" />]}>
				<SecurityClient />
			</MainLayout>
		</HydrationBoundary>
	);
}
