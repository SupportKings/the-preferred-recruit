import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { ManageDerivedCampaignModal } from "@/features/campaigns/components/modals/manage-derived-campaign-modal";

import {
	createColumnHelper,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { GitBranch } from "lucide-react";
import { formatCampaignType } from "../../utils/format";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

// Create columns for derived campaigns
const createDerivedCampaignColumns = () => {
	const columnHelper = createColumnHelper<any>();
	return [
		columnHelper.accessor("name", {
			header: "Campaign Name",
			cell: (info) => {
				const campaignId = info.row.original.id;
				const name = info.getValue() || "Unknown";

				if (!campaignId) return name;

				return (
					<Link
						href={`/dashboard/campaigns/${campaignId}`}
						className="text-primary hover:underline"
					>
						{name}
					</Link>
				);
			},
		}),
		columnHelper.accessor("type", {
			header: "Type",
			cell: (info) => (
				<StatusBadge>{formatCampaignType(info.getValue())}</StatusBadge>
			),
		}),
		columnHelper.accessor("status", {
			header: "Status",
			cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
		}),
		columnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		columnHelper.accessor("end_date", {
			header: "End Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		columnHelper.accessor("primary_lead_list.name", {
			header: "Primary Lead List",
			cell: (info) => {
				const leadList = info.row.original.primary_lead_list;

				if (!leadList) return "—";

				const name = leadList.name || "Unnamed";
				const priority = leadList.priority;
				const leadListId = leadList.id;

				const content = (
					<div className="flex flex-col gap-1">
						<div>{name}</div>
						{priority != null && (
							<div className="text-muted-foreground text-xs">
								Priority: {priority}
							</div>
						)}
					</div>
				);

				// Make clickable if we have an ID
				if (leadListId) {
					return (
						<Link
							href={`/dashboard/school-lead-lists/${leadListId}`}
							className="text-primary hover:underline"
						>
							{content}
						</Link>
					);
				}

				return content;
			},
		}),
	];
};

interface DerivedCampaignsTabProps {
	campaignId: string;
	athleteId: string;
	derivedCampaigns: any[];
}

export function DerivedCampaignsTab({
	campaignId,
	athleteId,
	derivedCampaigns,
}: DerivedCampaignsTabProps) {
	const campaignColumns = createDerivedCampaignColumns();

	const campaignsTable = useReactTable({
		data: derivedCampaigns || [],
		columns: campaignColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!derivedCampaigns || derivedCampaigns.length === 0) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<GitBranch className="h-5 w-5" />
							Derived Campaigns
						</CardTitle>
						<ManageDerivedCampaignModal
							campaignId={campaignId}
							athleteId={athleteId}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<GitBranch className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No derived campaigns yet</p>
						<p className="mt-1 text-xs">
							Campaigns derived from this one will appear here
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<GitBranch className="h-5 w-5" />
						Derived Campaigns
					</CardTitle>
					<ManageDerivedCampaignModal
						campaignId={campaignId}
						athleteId={athleteId}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={campaignsTable}
					emptyStateMessage="No derived campaigns found"
				/>
			</CardContent>
		</Card>
	);
}
