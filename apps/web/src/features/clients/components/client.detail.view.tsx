"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

import { Building, Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import type { ClientWithRelations } from "../types/client";

interface ClientDetailViewProps {
	client: ClientWithRelations;
}

export default function ClientDetailView({ client }: ClientDetailViewProps) {
	const fullName = `${client.first_name} ${client.last_name}`;
	const initials =
		`${client.first_name[0]}${client.last_name[0]}`.toUpperCase();

	const handleCopyClientId = async () => {
		try {
			await navigator.clipboard.writeText(client.id);
			toast.success("Client ID copied to clipboard");
		} catch (error) {
			toast.error("Failed to copy Client ID");
		}
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarFallback className="font-semibold text-lg">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="font-bold text-2xl">{client.client_name}</h1>
					</div>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building className="h-5 w-5" />
							Client Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Contact Person
							</label>
							<p className="text-sm">{fullName}</p>
						</div>
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Email
							</label>
							<p className="text-sm">{client.email}</p>
						</div>
					</CardContent>
				</Card>

				{/* System Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Tag className="h-5 w-5" />
							Status Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Billing Status
							</label>
							<div className="mt-1">
								<StatusBadge>
									{client.billing_status?.status_name || "No status"}
								</StatusBadge>
							</div>
						</div>
						<div>
							<label className="font-medium text-muted-foreground text-sm">
								Onboarding Status
							</label>
							<div className="mt-1">
								<StatusBadge>
									{client.onboarding_status?.status_name || "No status"}
								</StatusBadge>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			{/* Status Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Tag className="h-5 w-5" />
						System Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Client ID
						</label>
						<div className="flex items-center gap-2">
							<p className="font-mono text-sm">{client.id}</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCopyClientId}
								className="h-6 w-6 p-0"
							>
								<Copy className="h-3 w-3" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
