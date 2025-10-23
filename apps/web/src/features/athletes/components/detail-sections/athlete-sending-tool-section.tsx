"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Loader2, Send } from "lucide-react";
import { getSendingToolLeadListsForAthlete } from "../../actions/sendingToolLeadLists";
import { ManageSendingToolLeadListModal } from "../modals/manage-sending-tool-lead-list-modal";
import {
	createSendingToolLeadListColumns,
	createSendingToolLeadListRowActions,
} from "../table-columns/sending-tool-lead-list-columns";

interface AthleteSendingToolSectionProps {
	athleteId: string;
	setDeleteModal?: (modal: any) => void;
}

export function AthleteSendingToolSection({
	athleteId,
	setDeleteModal,
}: AthleteSendingToolSectionProps) {
	const [sendingToolLeadLists, setSendingToolLeadLists] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	useEffect(() => {
		const fetchLists = async () => {
			setIsLoading(true);
			try {
				const lists = await getSendingToolLeadListsForAthlete(athleteId);
				setSendingToolLeadLists(lists);
			} catch (error) {
				console.error("Error fetching sending tool lead lists:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchLists();
	}, [athleteId]);

	const listColumns = createSendingToolLeadListColumns();
	const listRowActions = createSendingToolLeadListRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const listTable = useReactTable({
		data: sendingToolLeadLists || [],
		columns: listColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Send className="h-5 w-5" />
						Sending Tool Lead Lists (CSV Exports)
					</CardTitle>
					<ManageSendingToolLeadListModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">
						<Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin opacity-50" />
						<p className="text-sm">Loading sending tool lead lists...</p>
					</div>
				) : sendingToolLeadLists.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Send className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No sending tool lead lists yet</p>
						<p className="mt-1 text-xs">
							CSV export files will appear here once generated
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={listTable}
						rowActions={listRowActions}
						inlineActions={true}
						emptyStateMessage="No sending tool lead lists found"
						totalCount={sendingToolLeadLists.length}
					/>
				)}
			</CardContent>

			<ManageSendingToolLeadListModal
				athleteId={athleteId}
				list={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "sendingToolList"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
