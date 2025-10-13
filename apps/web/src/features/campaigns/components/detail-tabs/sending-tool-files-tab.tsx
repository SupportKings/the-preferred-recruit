import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

// import { ManageSendingToolLeadListModal } from "@/features/athletes/components/modals/manage-sending-tool-lead-list-modal";
import {
	createSendingToolLeadListColumns,
	createSendingToolLeadListRowActions,
} from "@/features/athletes/components/table-columns/sending-tool-lead-list-columns";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { FileText } from "lucide-react";

interface SendingToolFilesTabProps {
	campaignId: string;
	sendingToolLeadLists: any[];
	setDeleteModal: (modal: any) => void;
}

export function SendingToolFilesTab({
	campaignId,
	sendingToolLeadLists,
	setDeleteModal,
}: SendingToolFilesTabProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const fileColumns = createSendingToolLeadListColumns();
	const fileRowActions = createSendingToolLeadListRowActions(
		setDeleteModal,
		setEditModal,
	);

	const filesTable = useReactTable({
		data: sendingToolLeadLists || [],
		columns: fileColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!sendingToolLeadLists || sendingToolLeadLists.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Sending Tool Files
					</CardTitle>
					{/* TODO: Create campaign-specific modal for managing sending tool files */}
					{/* <ManageSendingToolLeadListModal campaignId={campaignId} mode="add" /> */}
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No sending tool files yet</p>
						<p className="mt-1 text-xs">
							Sending tool export files will appear here once generated for this
							campaign
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Sending Tool Files
				</CardTitle>
				{/* TODO: Create campaign-specific modal for managing sending tool files */}
				{/* <ManageSendingToolLeadListModal campaignId={campaignId} mode="add" /> */}
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={filesTable}
					rowActions={fileRowActions}
					emptyStateMessage="No sending tool files found for this campaign"
				/>
			</CardContent>

			{/* <ManageSendingToolLeadListModal
				campaignId={campaignId}
				sendingToolLeadList={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "sending_tool_lead_list"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/> */}
		</Card>
	);
}
