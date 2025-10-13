"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Trophy } from "lucide-react";

import { ManageResultModal } from "../modals/manage-result-modal";
import {
	createResultColumns,
	createResultRowActions,
} from "../table-columns/result-columns";

interface AthleteResultsSectionProps {
	athleteId: string;
	results: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteResultsSection({
	athleteId,
	results,
	setDeleteModal,
}: AthleteResultsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const resultColumns = createResultColumns();
	const resultRowActions = createResultRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const resultTable = useReactTable({
		data: results || [],
		columns: resultColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						Results
					</CardTitle>
					<ManageResultModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{results.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No results yet</p>
						<p className="mt-1 text-xs">
							Athletic results will appear here once added
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={resultTable}
						rowActions={resultRowActions}
						emptyStateMessage="No results found for this athlete"
						totalCount={results.length}
					/>
				)}
			</CardContent>

			<ManageResultModal
				athleteId={athleteId}
				result={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "result"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
