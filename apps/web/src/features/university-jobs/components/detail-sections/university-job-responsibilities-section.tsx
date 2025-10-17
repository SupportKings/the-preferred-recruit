import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ListChecks } from "lucide-react";

import { NoResponsibilities } from "../empty-states/no-responsibilities";
import { ManageResponsibilityModal } from "../manage-responsibility-modal";
import {
	createResponsibilitiesColumns,
	createResponsibilitiesRowActions,
} from "../table-columns/responsibilities-columns";

interface UniversityJobResponsibilitiesSectionProps {
	universityJobId: string;
	responsibilities: Array<{
		id: string;
		event_group: string | null;
		events: {
			id: string;
			code: string | null;
			name: string | null;
			event_group: string | null;
		} | null;
		internal_notes: string | null;
	}>;
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void;
}

export function UniversityJobResponsibilitiesSection({
	universityJobId,
	responsibilities,
	setDeleteModal,
}: UniversityJobResponsibilitiesSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: unknown;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const responsibilitiesColumns = createResponsibilitiesColumns();
	const responsibilitiesRowActions = createResponsibilitiesRowActions(
		setDeleteModal,
		setEditModal,
	);

	const responsibilitiesTable = useReactTable({
		data: responsibilities || [],
		columns: responsibilitiesColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!responsibilities || responsibilities.length === 0) {
		return <NoResponsibilities universityJobId={universityJobId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<ListChecks className="h-5 w-5" />
						Responsibilities
					</CardTitle>
					<ManageResponsibilityModal
						universityJobId={universityJobId}
						mode="add"
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={responsibilitiesTable}
					rowActions={responsibilitiesRowActions}
					emptyStateMessage="No responsibilities found for this position"
				/>
			</CardContent>

			<ManageResponsibilityModal
				universityJobId={universityJobId}
				responsibility={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "responsibility"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
