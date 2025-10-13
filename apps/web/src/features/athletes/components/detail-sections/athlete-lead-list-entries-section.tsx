"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Database } from "lucide-react";

import { ManageLeadListEntryModal } from "../modals/manage-lead-list-entry-modal";

import {
	createLeadListEntryColumns,
	createLeadListEntryRowActions,
} from "../table-columns/lead-list-entry-columns";

interface AthleteLeadListEntriesSectionProps {
	athleteId: string;
	leadListEntries?: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteLeadListEntriesSection({
	athleteId,
	leadListEntries = [],
	setDeleteModal,
}: AthleteLeadListEntriesSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const entryColumns = createLeadListEntryColumns();
	const entryRowActions = createLeadListEntryRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const entryTable = useReactTable({
		data: leadListEntries || [],
		columns: entryColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						Lead List Entries
					</CardTitle>
					<ManageLeadListEntryModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{leadListEntries.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No lead list entries yet</p>
						<p className="mt-1 text-xs">
							Entries will appear here once schools are added to lead lists
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={entryTable}
						rowActions={entryRowActions}
						emptyStateMessage="No lead list entries found"
						totalCount={leadListEntries.length}
					/>
				)}
			</CardContent>

			<ManageLeadListEntryModal
				athleteId={athleteId}
				entry={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "leadListEntry"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
