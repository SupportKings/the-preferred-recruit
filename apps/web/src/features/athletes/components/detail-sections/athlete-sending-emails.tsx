"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getAthleteSendingEmails,
	type SendingEmailWithStatus,
	setPrimarySendingEmail,
} from "@/features/athletes/actions/sendingEmails";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Check, Mail, MoreHorizontal, Pencil, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { ManageSendingEmailAccountModal } from "../modals/manage-sending-email-account-modal";

interface AthleteSendingEmailsSectionProps {
	athleteId: string;
}

export function AthleteSendingEmails({
	athleteId,
}: AthleteSendingEmailsSectionProps) {
	const [sendingEmails, setSendingEmails] = useState<SendingEmailWithStatus[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [editingEmail, setEditingEmail] =
		useState<SendingEmailWithStatus | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const queryClient = useQueryClient();

	const fetchSendingEmails = useCallback(async () => {
		setLoading(true);
		const emails = await getAthleteSendingEmails(athleteId);
		setSendingEmails(emails);
		setLoading(false);
	}, [athleteId]);

	useEffect(() => {
		fetchSendingEmails();
	}, [fetchSendingEmails]);

	const handleSetPrimary = async (sendingEmailId: string) => {
		try {
			const result = await setPrimarySendingEmail({
				athleteId,
				sendingEmailId,
			});

			if (result?.data?.success) {
				toast.success("Primary email updated successfully");
				await fetchSendingEmails();
				await queryClient.invalidateQueries({
					queryKey: athleteQueries.detail(athleteId),
				});
			}
		} catch (error) {
			console.error("Error setting primary email:", error);
			toast.error("Failed to set primary email");
		}
	};

	const handleEditClick = (email: SendingEmailWithStatus) => {
		setEditingEmail(email);
		setIsEditModalOpen(true);
	};

	const handleModalClose = async (open: boolean) => {
		setIsEditModalOpen(open);
		if (!open) {
			setEditingEmail(null);
			await fetchSendingEmails();
		}
	};

	const columns: ColumnDef<SendingEmailWithStatus>[] = [
		{
			accessorKey: "email",
			header: "Email Address",
			cell: ({ row }) => {
				const email = row.original;
				const emailAddress = `${email.username}@${email.domain?.domain_url || ""}`;
				return (
					<div className="flex items-center gap-2">
						<span className="font-medium">{emailAddress}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "name",
			header: "Account Name",
			cell: ({ row }) => {
				const name = row.original.name;
				return (
					<span className={!name ? "text-muted-foreground" : ""}>
						{name || "—"}
					</span>
				);
			},
		},
		{
			accessorKey: "domain",
			header: "Domain",
			cell: ({ row }) => {
				return (
					<span className="font-mono text-sm">
						{row.original.domain?.domain_url || "—"}
					</span>
				);
			},
		},
		{
			accessorKey: "is_primary",
			header: "Status",
			cell: ({ row }) => {
				const isPrimary = row.original.is_primary;
				return isPrimary ? (
					<Badge variant="default" className="gap-1">
						<Check className="h-3 w-3" />
						Primary
					</Badge>
				) : (
					<Badge variant="secondary">Secondary</Badge>
				);
			},
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const email = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleEditClick(email)}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							{!email.is_primary && (
								<DropdownMenuItem onClick={() => handleSetPrimary(email.id)}>
									<Star className="mr-2 h-4 w-4" />
									Set as Primary
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: sendingEmails,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Sending Email Accounts
					</CardTitle>
					<ManageSendingEmailAccountModal
						athleteId={athleteId}
						mode="create"
						onSuccess={fetchSendingEmails}
					>
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							Add Email Account
						</Button>
					</ManageSendingEmailAccountModal>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="py-8 text-center text-muted-foreground">
						<p className="text-sm">Loading sending email accounts...</p>
					</div>
				) : sendingEmails.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Mail className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No sending email accounts</p>
						<p className="mt-1 text-xs">
							Add a sending email account for this athlete to use in campaigns
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={table}
						inlineActions={false}
						emptyStateMessage="No sending email accounts found"
						totalCount={sendingEmails.length}
					/>
				)}
			</CardContent>

			{/* Edit Modal */}
			{editingEmail && (
				<ManageSendingEmailAccountModal
					athleteId={athleteId}
					mode="edit"
					currentSendingEmail={editingEmail}
					open={isEditModalOpen}
					onOpenChange={handleModalClose}
					onSuccess={fetchSendingEmails}
				/>
			)}
		</Card>
	);
}
