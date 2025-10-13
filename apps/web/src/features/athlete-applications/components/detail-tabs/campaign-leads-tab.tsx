import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Target } from "lucide-react";
import { NoCampaignLeads } from "../empty-states/no-campaign-leads";
import { ManageCampaignLeadModal } from "../manage-campaign-lead-modal";
import {
	createCampaignLeadsColumns,
	createCampaignLeadsRowActions,
} from "../table-columns/campaign-leads-columns";

interface CampaignLeadsTabProps {
	applicationId: string;
	leads: any[];
	campaigns?: Array<{ id: string; name: string; type: string }>;
	universities?: Array<{ id: string; name: string; city: string | null }>;
	programs?: Array<{ id: string; gender: string; university_id: string }>;
	coaches?: Array<{
		id: string;
		full_name: string;
		university_jobs: Array<{
			id: string;
			job_title: string;
			work_email: string | null;
		}>;
	}>;
	setDeleteModal: (modal: any) => void;
}

export function CampaignLeadsTab({
	applicationId,
	leads,
	campaigns,
	universities,
	programs,
	coaches,
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

	const leadsColumns = createCampaignLeadsColumns();
	const leadsRowActions = createCampaignLeadsRowActions(
		setDeleteModal,
		setEditModal,
	);

	const leadsTable = useReactTable({
		data: leads || [],
		columns: leadsColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!leads || leads.length === 0) {
		return (
			<NoCampaignLeads
				applicationId={applicationId}
				campaigns={campaigns}
				universities={universities}
				programs={programs}
				coaches={coaches}
			/>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Campaign Leads (Linked)
					</CardTitle>
					<ManageCampaignLeadModal
						applicationId={applicationId}
						mode="add"
						campaigns={campaigns}
						universities={universities}
						programs={programs}
						coaches={coaches}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={leadsTable}
					rowActions={leadsRowActions}
					emptyStateMessage="No campaign leads found for this application"
				/>
			</CardContent>

			<ManageCampaignLeadModal
				applicationId={applicationId}
				lead={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "campaign_lead"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
