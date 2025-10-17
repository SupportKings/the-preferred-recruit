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

interface UniversityJobRepliesSectionProps {
	universityJobId: string;
	replies: Array<{
		id: string;
		type: string | null;
		occurred_at: string | null;
		summary: string | null;
		internal_notes: string | null;
		campaigns: {
			id: string;
			name: string | null;
			type: string | null;
		} | null;
		athlete_applications: {
			id: string;
			stage: string | null;
			last_interaction_at: string | null;
		} | null;
		athletes: {
			id: string;
			full_name: string;
			contact_email: string | null;
		} | null;
	}>;
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void;
}

export function UniversityJobRepliesSection({
	universityJobId,
	replies,
	setDeleteModal,
}: UniversityJobRepliesSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: unknown;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const repliesColumns = createRepliesColumns();
	const repliesRowActions = createRepliesRowActions(setDeleteModal, setEditModal);

	const repliesTable = useReactTable({
		data: replies || [],
		columns: repliesColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!replies || replies.length === 0) {
		return <NoReplies universityJobId={universityJobId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Replies
					</CardTitle>
					<ManageReplyModal universityJobId={universityJobId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={repliesTable}
					rowActions={repliesRowActions}
					emptyStateMessage="No replies found for this position"
				/>
			</CardContent>

			<ManageReplyModal
				universityJobId={universityJobId}
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
