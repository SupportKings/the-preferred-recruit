import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MessageSquare } from "lucide-react";
import { NoReplies } from "../empty-states/no-replies";
import { ManageReplyModal } from "../manage-reply-modal";
import {
	createRepliesColumns,
	createRepliesRowActions,
} from "../table-columns/replies-columns";

interface RepliesTabProps {
	applicationId: string;
	replies: any[];
	campaigns?: Array<{ id: string; name: string; type: string }>;
	coaches?: Array<{
		id: string;
		full_name: string;
		university_jobs: Array<{ id: string; job_title: string }>;
	}>;
	setDeleteModal: (modal: any) => void;
}

export function RepliesTab({
	applicationId,
	replies,
	campaigns,
	coaches,
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

	const repliesColumns = createRepliesColumns();
	const repliesRowActions = createRepliesRowActions(
		setDeleteModal,
		setEditModal,
	);

	const repliesTable = useReactTable({
		data: replies || [],
		columns: repliesColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!replies || replies.length === 0) {
		return (
			<NoReplies
				applicationId={applicationId}
				campaigns={campaigns}
				coaches={coaches}
			/>
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
						applicationId={applicationId}
						mode="add"
						campaigns={campaigns}
						coaches={coaches}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={repliesTable}
					rowActions={repliesRowActions}
					emptyStateMessage="No replies found for this application"
				/>
			</CardContent>

			<ManageReplyModal
				applicationId={applicationId}
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
