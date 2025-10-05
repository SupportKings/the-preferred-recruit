import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getClient } from "@/features/clients/actions/getClient";
import ClientDetailSkeleton from "@/features/clients/components/client.detail.skeleton";
import ClientDetailView from "@/features/clients/components/client.detail.view";
import ClientDetailHeader from "@/features/clients/layout/client.detail.header";
import type { ClientWithRelations } from "@/features/clients/types/client";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ClientDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
	return (
		<Suspense fallback={<ClientDetailSkeleton clientId="" />}>
			<ClientDetailPageAsync params={params} />
		</Suspense>
	);
}

async function ClientDetailPageAsync({ params }: ClientDetailPageProps) {
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

	// Prefetch the client data
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
					<ClientDetailHeader
						key="client-detail-header"
						clientId={id}
						clientName={clientName}
					/>,
				]}
			>
				<ClientDetailView client={client} />
			</MainLayout>
		</HydrationBoundary>
	);
}
