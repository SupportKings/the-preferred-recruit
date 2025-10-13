import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

export const createCampaignColumns = () => {
	const campaignColumnHelper = createColumnHelper<any>();
	return [
		// Campaign Name (with link)
		campaignColumnHelper.accessor("name", {
			header: "Campaign Name",
			cell: (info) => {
				const campaignId = info.row.original.id;
				return (
					<Link
						href={`/dashboard/campaigns/${campaignId}`}
						className="flex items-center gap-1 text-primary hover:underline"
					>
						{info.getValue() || "Unnamed Campaign"}
						<ExternalLink className="h-3 w-3" />
					</Link>
				);
			},
		}),

		// Type
		campaignColumnHelper.accessor("type", {
			header: "Type",
			cell: (info) => <StatusBadge>{info.getValue() || "N/A"}</StatusBadge>,
		}),

		// Status
		campaignColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
		}),

		// Start Date
		campaignColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// End Date
		campaignColumnHelper.accessor("end_date", {
			header: "End Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Daily Send Cap
		campaignColumnHelper.accessor("daily_send_cap", {
			header: "Daily Cap",
			cell: (info) => info.getValue() || "N/A",
		}),
	];
};
