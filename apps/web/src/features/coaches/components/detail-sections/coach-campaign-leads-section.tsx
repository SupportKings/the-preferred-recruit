import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Plus, TargetIcon } from "lucide-react";
import { NoCampaignLeads } from "../empty-states/no-campaign-leads";
import { ManageCampaignLeadModal } from "../modals/manage-campaign-lead-modal";
import { createCampaignLeadsColumns } from "../table-columns/campaign-leads-columns";

interface CoachCampaignLeadsSectionProps {
	coachId: string;
	campaignLeads: any[];
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void;
}

export function CoachCampaignLeadsSection({
	coachId,
	campaignLeads,
	setDeleteModal,
}: CoachCampaignLeadsSectionProps) {
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const handleDelete = (lead: any) => {
		setDeleteModal({
			isOpen: true,
			type: "campaign_lead",
			id: lead.id,
			title: `Delete lead for ${lead.campaigns?.name || "Unknown Campaign"}`,
		});
	};

	const leadColumns = createCampaignLeadsColumns(handleDelete);

	const leadTable = useReactTable({
		data: campaignLeads || [],
		columns: leadColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!campaignLeads || campaignLeads.length === 0) {
		return <NoCampaignLeads coachId={coachId} />;
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<TargetIcon className="h-5 w-5" />
							Campaign Leads
						</CardTitle>
						<ManageCampaignLeadModal
							coachId={coachId}
							open={createModalOpen}
							onOpenChange={setCreateModalOpen}
						>
							<Button size="sm" variant="outline">
								<Plus className="mr-2 h-4 w-4" />
								Add Lead
							</Button>
						</ManageCampaignLeadModal>
					</div>
				</CardHeader>
				<CardContent>
					<UniversalDataTable
						table={leadTable}
						emptyStateMessage="No campaign leads found for this coach"
					/>
				</CardContent>
			</Card>
		</>
	);
}
