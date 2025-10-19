import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getContact } from "@/features/contacts/actions/getContact";
import ContactDetailSkeleton from "@/features/contacts/components/contact.detail.skeleton";
import ContactDetailView from "@/features/contacts/components/contact.detail.view";
import ContactDetailHeader from "@/features/contacts/layout/contact.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ContactDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
	return (
		<Suspense fallback={<ContactDetailSkeleton contactId="" />}>
			<ContactDetailPageAsync params={params} />
		</Suspense>
	);
}

async function ContactDetailPageAsync({ params }: ContactDetailPageProps) {
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

	// Prefetch the contact data
	await queryClient.prefetchQuery({
		queryKey: ["contacts", "detail", id],
		queryFn: () => getContact(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ContactDetailHeader key="contact-detail-header" contactId={id} />,
				]}
			>
				<ContactDetailView contactId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
