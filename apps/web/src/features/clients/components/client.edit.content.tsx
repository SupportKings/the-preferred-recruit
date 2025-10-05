"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useClient } from "@/features/clients/queries/useClients";

import ClientForm from "./client-form";

interface ClientEditContentProps {
	clientId: string;
}

export default function ClientEditContent({
	clientId,
}: ClientEditContentProps) {
	const { data: client, error } = useClient(clientId);

	if (error || !client) {
		return (
			<div className="py-12 text-center">
				<h2 className="font-semibold text-2xl text-gray-900">
					Client not found
				</h2>
				<p className="mt-2 text-gray-600">
					The client you're trying to edit doesn't exist or has been removed.
				</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard/clients">Back to Clients</Link>
				</Button>
			</div>
		);
	}

	// Transform the client data for the form
	const formData = {
		id: client.id,
		client_name: client.client_name,
		email: client.email,
		first_name: client.first_name,
		last_name: client.last_name,
		billing_status_id: client.billing_status_id || "none",
		onboarding_status_id: client.onboarding_status_id || "none",
	};

	return (
		<div className="p-6">
			<ClientForm mode="edit" initialData={formData} />
		</div>
	);
}
