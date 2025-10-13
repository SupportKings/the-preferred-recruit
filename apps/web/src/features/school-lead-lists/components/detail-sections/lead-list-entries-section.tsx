import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ListTree } from "lucide-react";
import { NoEntries } from "../empty-states/no-entries";
import { ManageEntryModal } from "../manage-entry-modal";
import {
	createEntryColumns,
	createEntryRowActions,
} from "../table-columns/entry-columns";

interface LeadListEntriesSectionProps {
	leadListId: string;
	entries: any[];
	setDeleteModal: (modal: any) => void;
}

export function LeadListEntriesSection({
	leadListId,
	entries,
	setDeleteModal,
}: LeadListEntriesSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const entryColumns = createEntryColumns(leadListId);
	const entryRowActions = createEntryRowActions(setDeleteModal, setEditModal);

	const entryTable = useReactTable({
		data: entries || [],
		columns: entryColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!entries || entries.length === 0) {
		return <NoEntries leadListId={leadListId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<ListTree className="h-5 w-5" />
						Entries (Universities/Programs)
					</CardTitle>
					<ManageEntryModal leadListId={leadListId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={entryTable}
					rowActions={entryRowActions}
					emptyStateMessage="No entries found for this lead list"
				/>
			</CardContent>

			<ManageEntryModal
				leadListId={leadListId}
				entry={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "entry"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
