import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

type CampaignLeadRow = {
	id: string;
	campaign_id: string | null;
	include_reason: string | null;
	included_at: string | null;
	status: string | null;
	first_reply_at: string | null;
	internal_notes: string | null;
	campaigns?: {
		id: string | null;
		name: string | null;
		type: string | null;
		status: string | null;
	} | null;
	school_lead_lists?: {
		name: string | null;
		priority: number | null;
	} | null;
	universities?: {
		name: string | null;
		city: string | null;
		region: string | null;
	} | null;
	programs?: {
		gender: string | null;
	} | null;
	university_jobs?: {
		job_title: string | null;
		work_email: string | null;
	} | null;
	athlete_applications?: {
		stage: string | null;
		last_interaction_at: string | null;
	} | null;
};

export const createCampaignLeadsColumns = (
	onDelete?: (lead: CampaignLeadRow) => void,
) => {
	const columnHelper = createColumnHelper<CampaignLeadRow>();
	const columns: any[] = [
		columnHelper.accessor("campaigns.name", {
			header: "Campaign",
			cell: (info) => {
				const campaignName =
					info.getValue() || info.row.original.campaigns?.name || "Unknown";
				const campaignId =
					info.row.original.campaign_id || info.row.original.campaigns?.id;

				if (!campaignId) {
					return <span>{campaignName}</span>;
				}

				return (
					<div className="flex items-center gap-2">
						<a
							href={`/dashboard/campaigns/${campaignId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{campaignName}
						</a>
						<a
							href={`/dashboard/campaigns/${campaignId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80"
							onClick={(e) => e.stopPropagation()}
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				);
			},
		}),
		columnHelper.accessor("campaigns.type", {
			header: "Type",
			cell: (info) => (
				<StatusBadge>
					{info.getValue() || info.row.original.campaigns?.type || "N/A"}
				</StatusBadge>
			),
		}),
		columnHelper.accessor("campaigns.status", {
			header: "Campaign Status",
			cell: (info) => (
				<StatusBadge>
					{info.getValue() || info.row.original.campaigns?.status || "N/A"}
				</StatusBadge>
			),
		}),
		columnHelper.accessor("school_lead_lists.name", {
			header: "Lead List",
			cell: (info) =>
				info.getValue() ||
				info.row.original.school_lead_lists?.name ||
				"Unknown",
		}),
		columnHelper.accessor("universities.name", {
			header: "University",
			cell: (info) =>
				info.getValue() || info.row.original.universities?.name || "Unknown",
		}),
		columnHelper.accessor("programs.gender", {
			header: "Program",
			cell: (info) =>
				info.getValue() || info.row.original.programs?.gender || "N/A",
		}),
		columnHelper.accessor("university_jobs.job_title", {
			header: "Job Title",
			cell: (info) =>
				info.getValue() ||
				info.row.original.university_jobs?.job_title ||
				"N/A",
		}),
		columnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => <StatusBadge>{info.getValue() || "Unknown"}</StatusBadge>,
		}),
		columnHelper.accessor("included_at", {
			header: "Included At",
			cell: (info) => formatDate(info.getValue()),
		}),
		columnHelper.accessor("first_reply_at", {
			header: "First Reply",
			cell: (info) => formatDate(info.getValue()),
		}),
	];

	if (onDelete) {
		columns.push(
			columnHelper.display({
				id: "actions",
				header: "",
				cell: (info) => (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(info.row.original);
						}}
						className="text-destructive hover:text-destructive/80"
						aria-label="Delete"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				),
			}),
		);
	}

	return columns;
};

export const createCampaignLeadsRowActions = (
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void,
) => [
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (lead: CampaignLeadRow) => {
			setDeleteModal({
				isOpen: true,
				type: "campaign_lead",
				id: lead.id,
				title: `Delete lead for ${lead.campaigns?.name || "Unknown Campaign"}`,
			});
		},
	},
];
