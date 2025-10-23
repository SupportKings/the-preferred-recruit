"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Users } from "lucide-react";
import { ManageContactModal } from "../manage-contact-modal";
import {
	createContactColumns,
	createContactRowActions,
} from "../table-columns/contact-columns";

interface AthleteContactsSectionProps {
	athleteId: string;
	contactAthletes: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteContactsSection({
	athleteId,
	contactAthletes,
	setDeleteModal,
}: AthleteContactsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const contactColumns = createContactColumns();
	const contactRowActions = createContactRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const contactTable = useReactTable({
		data: contactAthletes || [],
		columns: contactColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Contacts
					</CardTitle>
					<ManageContactModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{contactAthletes.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No contacts yet</p>
						<p className="mt-1 text-xs">
							Contacts will appear here once added to this athlete
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={contactTable}
						rowActions={contactRowActions}
						inlineActions={true}
						emptyStateMessage="No contacts found for this athlete"
						totalCount={contactAthletes.length}
					/>
				)}
			</CardContent>

			<ManageContactModal
				athleteId={athleteId}
				contactAthlete={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "contact"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
