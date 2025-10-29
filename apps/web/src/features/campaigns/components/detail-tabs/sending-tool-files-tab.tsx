import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { ManageSendingToolLeadListModal } from "@/features/athletes/components/modals/manage-sending-tool-lead-list-modal";
import {
	createSendingToolLeadListColumns,
	createSendingToolLeadListRowActions,
} from "@/features/athletes/components/table-columns/sending-tool-lead-list-columns";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { FileText, PlusIcon } from "lucide-react";

interface SendingToolFilesTabProps {
	campaignId: string;
	athleteId: string;
	sendingToolLeadLists: any[];
	setDeleteModal: (modal: any) => void;
}

export function SendingToolFilesTab({
	campaignId,
	athleteId,
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

	const fileColumns = createSendingToolLeadListColumns({ hideCampaign: true });
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

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Sending Tool Files
					</CardTitle>
					<ManageSendingToolLeadListModal
						athleteId={athleteId}
						campaignId={campaignId}
						mode="add"
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={filesTable}
					rowActions={fileRowActions}
					emptyStateMessage="No sending tool files found for this campaign"
					emptyStateAction={
						<ManageSendingToolLeadListModal
							athleteId={athleteId}
							campaignId={campaignId}
							mode="add"
						>
							<Button size="sm">
								<PlusIcon className="h-4 w-4" />
								Add Sending Tool File
							</Button>
						</ManageSendingToolLeadListModal>
					}
				/>
			</CardContent>

			<ManageSendingToolLeadListModal
				athleteId={athleteId}
				campaignId={campaignId}
				mode="edit"
				list={editModal.data}
				open={editModal.isOpen && editModal.type === "sending_tool_lead_list"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
