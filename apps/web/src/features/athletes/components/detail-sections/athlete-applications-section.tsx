"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { GraduationCap } from "lucide-react";
import { ManageApplicationModal } from "../modals/manage-application-modal";
import {
	createApplicationColumns,
	createApplicationRowActions,
} from "../table-columns/application-columns";

interface AthleteApplicationsSectionProps {
	athleteId: string;
	applications: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteApplicationsSection({
	athleteId,
	applications,
	setDeleteModal,
}: AthleteApplicationsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const applicationColumns = createApplicationColumns();
	const applicationRowActions = createApplicationRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const applicationTable = useReactTable({
		data: applications || [],
		columns: applicationColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<GraduationCap className="h-5 w-5" />
						Applications
					</CardTitle>
					<ManageApplicationModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{applications.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<GraduationCap className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No applications yet</p>
						<p className="mt-1 text-xs">
							Applications will appear here once added to this athlete
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={applicationTable}
						rowActions={applicationRowActions}
						inlineActions={true}
						emptyStateMessage="No applications found for this athlete"
						totalCount={applications.length}
					/>
				)}
			</CardContent>

			<ManageApplicationModal
				athleteId={athleteId}
				application={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "application"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
