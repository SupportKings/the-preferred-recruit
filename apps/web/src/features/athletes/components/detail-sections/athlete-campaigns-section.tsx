"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Target } from "lucide-react";
import { ManageCampaignModal } from "../modals/manage-campaign-modal";
import {
	createCampaignColumns,
	createCampaignRowActions,
} from "../table-columns/campaign-columns";

interface AthleteCampaignsSectionProps {
	athleteId: string;
	campaigns: any[];
	setDeleteModal?: (modal: any) => void;
}

export function AthleteCampaignsSection({
	athleteId,
	campaigns,
	setDeleteModal,
}: AthleteCampaignsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const campaignColumns = createCampaignColumns();
	const campaignRowActions = createCampaignRowActions(
		setDeleteModal || (() => {}),
		setEditModal,
	);

	const campaignTable = useReactTable({
		data: campaigns || [],
		columns: campaignColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Campaigns
					</CardTitle>
					<ManageCampaignModal athleteId={athleteId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				{campaigns.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No campaigns yet</p>
						<p className="mt-1 text-xs">
							Outreach campaigns will appear here once created
						</p>
					</div>
				) : (
					<UniversalDataTable
						table={campaignTable}
						rowActions={campaignRowActions}
						emptyStateMessage="No campaigns found for this athlete"
						totalCount={campaigns.length}
					/>
				)}
			</CardContent>

			<ManageCampaignModal
				athleteId={athleteId}
				campaign={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "campaign"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
