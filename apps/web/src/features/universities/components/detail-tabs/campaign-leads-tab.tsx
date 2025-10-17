"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { updateCampaignLead } from "@/features/athletes/actions/campaignLeads";
import { ManageCampaignLeadModal } from "@/features/universities/components/shared/manage-campaign-lead-modal";
import { createCampaignLeadColumns } from "@/features/universities/components/table-columns/campaign-lead-columns";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { PlusIcon, Send } from "lucide-react";
import { toast } from "sonner";

interface CampaignLeadsTabProps {
	leads: any[];
	universityId: string;
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void;
	onRefresh: () => void;
}

export function CampaignLeadsTab({
	leads,
	universityId,
	setDeleteModal,
	onRefresh,
}: CampaignLeadsTabProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const handleInlineEdit = async (
		leadId: string,
		field: string,
		value: string | null,
	) => {
		try {
			await updateCampaignLead(leadId, {
				[field]: value,
			} as Parameters<typeof updateCampaignLead>[1]);

			toast.success("Campaign lead updated successfully");
			onRefresh();
		} catch (error) {
			console.error("Error updating campaign lead:", error);
			toast.error("Failed to update campaign lead");
		}
	};

	const leadColumns = createCampaignLeadColumns(
		handleInlineEdit,
		setDeleteModal,
		setEditModal,
	);

	const leadsTable = useReactTable({
		data: leads || [],
		columns: leadColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Send className="h-5 w-5" />
						Campaign Leads
					</CardTitle>
					<ManageCampaignLeadModal universityId={universityId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={leadsTable}
					emptyStateMessage="No campaign leads found for this university"
					emptyStateAction={
						<ManageCampaignLeadModal universityId={universityId} mode="add">
							<Button size="sm">
								<PlusIcon className="h-4 w-4" />
								Add Campaign Lead
							</Button>
						</ManageCampaignLeadModal>
					}
				/>
			</CardContent>

			<ManageCampaignLeadModal
				universityId={universityId}
				mode="edit"
				lead={editModal.data}
				open={editModal.isOpen && editModal.type === "campaign_lead"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
