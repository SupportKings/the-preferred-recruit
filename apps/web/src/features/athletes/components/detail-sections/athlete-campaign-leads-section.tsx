"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Users2 } from "lucide-react";
import { ManageCampaignLeadModal } from "../modals/manage-campaign-lead-modal";
import {
	createCampaignLeadColumns,
	createCampaignLeadRowActions,
} from "../table-columns/campaign-lead-columns";

interface AthleteCampaignLeadsSectionProps {
	athleteId: string;
	campaignLeads?: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteCampaignLeadsSection({
	athleteId,
	campaignLeads = [],
	setDeleteModal,
}: AthleteCampaignLeadsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const leadColumns = createCampaignLeadColumns();
	const leadRowActions = createCampaignLeadRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const leadTable = useReactTable({
		data: campaignLeads || [],
		columns: leadColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users2 className="h-5 w-5" />
						Campaign Leads
					</CardTitle>
					<ManageCampaignLeadModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{campaignLeads.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Users2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No campaign leads yet</p>
						<p className="mt-1 text-xs">
							Campaign leads will appear here once campaigns are initiated
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={leadTable}
						rowActions={leadRowActions}
						emptyStateMessage="No campaign leads found"
						totalCount={campaignLeads.length}
					/>
				)}
			</CardContent>

			<ManageCampaignLeadModal
				athleteId={athleteId}
				lead={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "campaignLead"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
