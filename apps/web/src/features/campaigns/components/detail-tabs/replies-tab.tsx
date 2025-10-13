import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { ManageReplyModal } from "@/features/athletes/components/modals/manage-reply-modal";
import {
	createReplyColumns,
	createReplyRowActions,
} from "@/features/athletes/components/table-columns/reply-columns";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MessageSquare } from "lucide-react";

interface RepliesTabProps {
	campaignId: string;
	athleteId: string;
	replies: any[];
	setDeleteModal: (modal: any) => void;
}

export function RepliesTab({
	campaignId,
	athleteId,
	replies,
	setDeleteModal,
}: RepliesTabProps) {
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
	const replyRowActions = createReplyRowActions(setDeleteModal, setEditModal);

	const repliesTable = useReactTable({
		data: replies || [],
		columns: replyColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!replies || replies.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Replies
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No replies yet</p>
						<p className="mt-1 text-xs">
							Coach replies will appear here once received for this campaign
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Replies
					</CardTitle>
					<ManageReplyModal
						athleteId={athleteId}
						campaignId={campaignId}
						mode="add"
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={repliesTable}
					rowActions={replyRowActions}
					emptyStateMessage="No replies found for this campaign"
				/>
			</CardContent>

			<ManageReplyModal
				athleteId={athleteId}
				campaignId={campaignId}
				mode="edit"
				reply={editModal.data}
				open={editModal.isOpen && editModal.type === "reply"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
