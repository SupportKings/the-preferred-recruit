import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import ClientAddSkeleton from "@/features/clients/components/client.add.skeleton";
import ClientForm from "@/features/clients/components/client-form";
import ClientAddHeader from "@/features/clients/layout/client.add.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function ClientAddPage() {
	return (
		<Suspense fallback={<ClientAddSkeleton />}>
			<ClientAddPageAsync />
		</Suspense>
	);
}

async function ClientAddPageAsync() {
	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<ClientAddHeader key="client-add-header" />]}>
				<div className="p-6">
					<ClientForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
