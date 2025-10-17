import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	createCampaignLeadColumns,
	createCampaignLeadRowActions,
} from "@/features/athletes/components/table-columns/campaign-lead-columns";
import { ManageCampaignLeadModal } from "@/features/campaigns/components/modals/manage-campaign-lead-modal";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { PlusIcon, Users } from "lucide-react";

interface CampaignLeadsTabProps {
	campaignId: string;
	athleteId: string;
	campaignLeads: any[];
	setDeleteModal: (modal: any) => void;
}

export function CampaignLeadsTab({
	campaignId,
	athleteId,
	campaignLeads,
	setDeleteModal,
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

	const leadColumns = createCampaignLeadColumns();
	const leadRowActions = createCampaignLeadRowActions(
		setDeleteModal,
		setEditModal,
	);

	const leadsTable = useReactTable({
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
						<Users className="h-5 w-5" />
						Campaign Leads
					</CardTitle>
					<ManageCampaignLeadModal
						campaignId={campaignId}
						athleteId={athleteId}
						mode="add"
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={leadsTable}
					rowActions={leadRowActions}
					emptyStateMessage="No campaign leads found for this campaign"
					emptyStateAction={
						<ManageCampaignLeadModal
							campaignId={campaignId}
							athleteId={athleteId}
							mode="add"
						>
							<Button size="sm">
								<PlusIcon className="h-4 w-4" />
								Add Campaign Lead
							</Button>
						</ManageCampaignLeadModal>
					}
				/>
			</CardContent>

			<ManageCampaignLeadModal
				campaignId={campaignId}
				athleteId={athleteId}
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
