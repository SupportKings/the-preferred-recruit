import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

// import { ManageCampaignLeadModal } from "@/features/athlete-applications/components/manage-campaign-lead-modal";
import {
	createCampaignLeadColumns,
	createCampaignLeadRowActions,
} from "@/features/athletes/components/table-columns/campaign-lead-columns";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Users } from "lucide-react";

interface CampaignLeadsTabProps {
	campaignId: string;
	campaignLeads: any[];
	setDeleteModal: (modal: any) => void;
}

export function CampaignLeadsTab({
	campaignId,
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

	if (!campaignLeads || campaignLeads.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Campaign Leads
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No campaign leads yet</p>
						<p className="mt-1 text-xs">
							Campaign leads will appear here once added to this campaign
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Campaign Leads
				</CardTitle>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={leadsTable}
					rowActions={leadRowActions}
					emptyStateMessage="No campaign leads found for this campaign"
				/>
			</CardContent>

			{/* TODO: Create campaign-specific modal for managing campaign leads */}
			{/* <ManageCampaignLeadModal
				campaignId={campaignId}
				campaignLead={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "campaign_lead"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/> */}
		</Card>
	);
}
