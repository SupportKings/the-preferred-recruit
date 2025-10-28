"use client";

import { useCallback, useMemo, useState } from "react";

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

	// Memoize the onOpenChange callback to prevent re-renders
	const handleModalOpenChange = useCallback((open: boolean) => {
		setEditModal((prev) => ({ ...prev, isOpen: open }));
	}, []);

	// Flatten checklist items from all checklists - memoized
	const checklistItems = useMemo(
		() => checklists.flatMap((checklist) => checklist.checklist_items || []),
		[checklists],
	);

	const checklistColumns = useMemo(() => createChecklistColumns(), []);

	const checklistRowActions = useMemo(
		() => createChecklistRowActions(setDeleteModal || (() => {}), setEditModal),
		[setDeleteModal, setEditModal],
	);

	const checklistTable = useReactTable({
		data: checklistItems || [],
		columns: checklistColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		initialState: {
			sorting: [
				{
					id: "sort_order",
					desc: false, // ascending order (1, 2, 3...)
				},
			],
		},
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
						inlineActions={true}
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
				onOpenChange={handleModalOpenChange}
			/>
		</Card>
	);
}
