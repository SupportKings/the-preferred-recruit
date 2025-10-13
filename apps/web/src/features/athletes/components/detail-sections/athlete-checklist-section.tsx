"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { CheckSquare } from "lucide-react";

import { ManageChecklistModal } from "../modals/manage-checklist-modal";
import {
	createChecklistColumns,
	createChecklistRowActions,
} from "../table-columns/checklist-columns";

interface AthleteChecklistSectionProps {
	athleteId: string;
	checklists: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteChecklistSection({
	athleteId,
	checklists,
	setDeleteModal,
}: AthleteChecklistSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	// Flatten checklist items from all checklists
	const checklistItems = checklists.flatMap(
		(checklist) => checklist.checklist_items || [],
	);

	const checklistColumns = createChecklistColumns();
	const checklistRowActions = createChecklistRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const checklistTable = useReactTable({
		data: checklistItems || [],
		columns: checklistColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<CheckSquare className="h-5 w-5" />
						Onboarding Checklist
					</CardTitle>
					<ManageChecklistModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{checklistItems.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<CheckSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No checklist items yet</p>
						<p className="mt-1 text-xs">
							Checklist items will appear here once added
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={checklistTable}
						rowActions={checklistRowActions}
						emptyStateMessage="No checklist items found"
						totalCount={checklistItems.length}
					/>
				)}
			</CardContent>

			<ManageChecklistModal
				athleteId={athleteId}
				checklistItem={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "checklist"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
