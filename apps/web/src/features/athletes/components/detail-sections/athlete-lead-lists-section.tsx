"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { List } from "lucide-react";

import { ManageLeadListModal } from "../modals/manage-lead-list-modal";
import {
	createLeadListColumns,
	createLeadListRowActions,
} from "../table-columns/lead-list-columns";

interface AthleteLeadListsSectionProps {
	athleteId: string;
	leadLists: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteLeadListsSection({
	athleteId,
	leadLists,
	setDeleteModal,
}: AthleteLeadListsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const leadListColumns = createLeadListColumns();
	const leadListRowActions = createLeadListRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const leadListTable = useReactTable({
		data: leadLists || [],
		columns: leadListColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<List className="h-5 w-5" />
						Lead Lists
					</CardTitle>
					<ManageLeadListModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{leadLists.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<List className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No lead lists yet</p>
						<p className="mt-1 text-xs">
							Lead lists will appear here once created for this athlete
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={leadListTable}
						rowActions={leadListRowActions}
						emptyStateMessage="No lead lists found for this athlete"
						totalCount={leadLists.length}
					/>
				)}
			</CardContent>

			<ManageLeadListModal
				athleteId={athleteId}
				leadList={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "leadList"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
