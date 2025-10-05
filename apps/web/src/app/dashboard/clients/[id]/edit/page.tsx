import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getClient } from "@/features/clients/actions/getClient";
import ClientEditContent from "@/features/clients/components/client.edit.content";
import ClientEditSkeleton from "@/features/clients/components/client.edit.skeleton";
import ClientEditHeader from "@/features/clients/layout/client.edit.header";
import type { ClientWithRelations } from "@/features/clients/types/client";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ClientEditPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ClientEditPage({ params }: ClientEditPageProps) {
	return (
		<Suspense fallback={<ClientEditSkeleton clientId="" />}>
			<ClientEditPageAsync params={params} />
		</Suspense>
	);
}

async function ClientEditPageAsync({ params }: ClientEditPageProps) {
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

	// Prefetch the client data for the form
	await queryClient.prefetchQuery({
		queryKey: ["clients", "detail", id],
		queryFn: () => getClient(id),
	});

	// Get the prefetched data to check if client exists
	const client = queryClient.getQueryData<ClientWithRelations>([
		"clients",
		"detail",
		id,
	]);

	if (!client) {
		notFound();
	}

	// Extract client name for header
	const clientName = client
		? `${client.client_name} (${client.first_name} ${client.last_name})`
		: undefined;

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ClientEditHeader
						key="client-edit-header"
						clientId={id}
						clientName={clientName}
					/>,
				]}
			>
				<ClientEditContent clientId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
