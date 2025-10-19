"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { PlusIcon, Users } from "lucide-react";
import { ManageContactAthleteModal } from "../manage-contact-athlete-modal";
import {
	createAthleteColumns,
	createAthleteRowActions,
} from "../table-columns/athlete-columns";

interface ContactAthletesSectionProps {
	contactId: string;
	contactAthletes: any[];
	setDeleteModal?: (modal: any) => void;
}

export function ContactAthletesSection({
	contactId,
	contactAthletes,
	setDeleteModal,
}: ContactAthletesSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const athleteColumns = createAthleteColumns();
	const athleteRowActions = createAthleteRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const athleteTable = useReactTable({
		data: contactAthletes || [],
		columns: athleteColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Athlete Relationships
					</CardTitle>
					<ManageContactAthleteModal contactId={contactId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{contactAthletes.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No athlete relationships yet</p>
						<p className="mt-1 text-xs">
							Athlete relationships will appear here once added to this contact
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={athleteTable}
						rowActions={athleteRowActions}
						emptyStateMessage="No athlete relationships found for this contact"
						totalCount={contactAthletes.length}
						emptyStateAction={
							<ManageContactAthleteModal contactId={contactId} mode="add">
								<Button size="sm">
									<PlusIcon className="h-4 w-4" />
									Add Athlete Relationship
								</Button>
							</ManageContactAthleteModal>
						}
					/>
				)}
			</CardContent>

			<ManageContactAthleteModal
				contactId={contactId}
				contactAthlete={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "athlete"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
