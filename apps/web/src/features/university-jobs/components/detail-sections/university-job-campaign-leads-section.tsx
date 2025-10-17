import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Users } from "lucide-react";

import { NoCampaignLeads } from "../empty-states/no-campaign-leads";
import { ManageCampaignLeadModal } from "../manage-campaign-lead-modal";
import {
	createCampaignLeadsColumns,
	createCampaignLeadsRowActions,
} from "../table-columns/campaign-leads-columns";

interface UniversityJobCampaignLeadsSectionProps {
	universityJobId: string;
	campaignLeads: Array<{
		id: string;
		status: string | null;
		first_reply_at: string | null;
		include_reason: string | null;
		internal_notes: string | null;
		campaigns: {
			id: string;
			name: string | null;
			type: string | null;
			status: string | null;
		} | null;
		universities: {
			id: string;
			name: string | null;
			city: string | null;
		} | null;
		programs: {
			id: string;
			gender: string | null;
		} | null;
	}>;
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void;
}

export function UniversityJobCampaignLeadsSection({
	universityJobId,
	campaignLeads,
	setDeleteModal,
}: UniversityJobCampaignLeadsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: unknown;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const campaignLeadsColumns = createCampaignLeadsColumns();
	const campaignLeadsRowActions = createCampaignLeadsRowActions(
		setDeleteModal,
		setEditModal,
	);

	const campaignLeadsTable = useReactTable({
		data: campaignLeads || [],
		columns: campaignLeadsColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!campaignLeads || campaignLeads.length === 0) {
		return <NoCampaignLeads universityJobId={universityJobId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Campaign Leads
					</CardTitle>
					<ManageCampaignLeadModal
						universityJobId={universityJobId}
						mode="add"
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={campaignLeadsTable}
					rowActions={campaignLeadsRowActions}
					emptyStateMessage="No campaign leads found for this position"
				/>
			</CardContent>

			<ManageCampaignLeadModal
				universityJobId={universityJobId}
				campaignLead={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "campaign-lead"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
