import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Eye, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

// Format campaign type for display
const formatType = (type: string | null | undefined): string => {
	if (!type) return "Unknown";

	const typeMap: Record<string, string> = {
		top: "Top Tier",
		second: "Second Pass",
		third: "Third Pass",
		personal_best: "Personal Best",
	};

	return typeMap[type.toLowerCase()] || type;
};

// Format campaign status
const formatStatus = (status: string | null | undefined): string => {
	if (!status) return "Unknown";

	const statusMap: Record<string, string> = {
		draft: "Draft",
		active: "Active",
		paused: "Paused",
		completed: "Completed",
		exhausted: "Exhausted",
	};

	return statusMap[status.toLowerCase()] || status;
};

export const createCampaignColumns = () => {
	const campaignColumnHelper = createColumnHelper<any>();
	return [
		// Campaign Name
		campaignColumnHelper.accessor("name", {
			header: "Campaign Name",
			cell: (info) => {
				const campaignId = info.row.original.id;
				const name = info.getValue() || "Unnamed Campaign";

				if (!campaignId) return name;

				return (
					<Link
						href={`/dashboard/campaigns/${campaignId}`}
						className="text-blue-600 hover:underline"
					>
						{name}
					</Link>
				);
			},
		}),

		// Type
		campaignColumnHelper.accessor("type", {
			header: "Type",
			cell: (info) => <StatusBadge>{formatType(info.getValue())}</StatusBadge>,
		}),

		// Status
		campaignColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) => (
				<StatusBadge>{formatStatus(info.getValue())}</StatusBadge>
			),
		}),

		// Start Date
		campaignColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Daily Send Cap
		campaignColumnHelper.accessor("daily_send_cap", {
			header: "Daily Cap",
			cell: (info) => info.getValue() ?? "N/A",
		}),

		// Leads Total
		campaignColumnHelper.accessor("leads_total", {
			header: "Total Leads",
			cell: (info) => info.getValue() ?? 0,
		}),

		// Leads Remaining
		campaignColumnHelper.accessor("leads_remaining", {
			header: "Remaining",
			cell: (info) => info.getValue() ?? 0,
		}),
	];
};

export const createCampaignRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "View",
		icon: Eye,
		onClick: (campaign: any) => {
			window.location.href = `/dashboard/campaigns/${campaign.id}`;
		},
	},
	{
		label: "Edit",
		icon: Edit,
		onClick: (campaign: any) => {
			setEditModal({
				isOpen: true,
				type: "campaign",
				data: campaign,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (campaign: any) => {
			setDeleteModal({
				isOpen: true,
				type: "campaign",
				id: campaign.id,
				title: `Delete campaign "${campaign.name || "Unnamed Campaign"}"`,
			});
		},
	},
];
