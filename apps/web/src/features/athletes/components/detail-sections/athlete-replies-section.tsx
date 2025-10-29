"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MessageCircle } from "lucide-react";
import { ManageReplyModal } from "../modals/manage-reply-modal";
import {
	createReplyColumns,
	createReplyRowActions,
} from "../table-columns/reply-columns";

interface AthleteRepliesSectionProps {
	athleteId: string;
	replies: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteRepliesSection({
	athleteId,
	replies,
	setDeleteModal,
}: AthleteRepliesSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const replyColumns = createReplyColumns();
	const replyRowActions = createReplyRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const replyTable = useReactTable({
		data: replies || [],
		columns: replyColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<MessageCircle className="h-5 w-5" />
						Replies
					</CardTitle>
					<ManageReplyModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{replies.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No replies yet</p>
						<p className="mt-1 text-xs">
							Coach replies will appear here once received
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={replyTable}
						rowActions={replyRowActions}
						emptyStateMessage="No replies found for this athlete"
						totalCount={replies.length}
					/>
				)}
			</CardContent>

			<ManageReplyModal
				athleteId={athleteId}
				reply={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "reply"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
