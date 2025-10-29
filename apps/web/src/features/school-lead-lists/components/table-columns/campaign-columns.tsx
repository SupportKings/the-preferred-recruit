import Link from "next/link";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { InlineCampaignStatusCell } from "./inline-campaign-status-cell";
import { InlineCampaignTypeCell } from "./inline-campaign-type-cell";

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

		// Type (inline editable)
		campaignColumnHelper.accessor("type", {
			header: "Type",
			cell: (info) => {
				const campaignId = info.row.original.id;
				const type = info.getValue();
				return (
					<InlineCampaignTypeCell
						campaignId={campaignId}
						currentType={type || "top"}
					/>
				);
			},
		}),

		// Status (inline editable)
		campaignColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) => {
				const campaignId = info.row.original.id;
				const status = info.getValue();
				return (
					<InlineCampaignStatusCell
						campaignId={campaignId}
						currentStatus={status || "draft"}
					/>
				);
			},
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

		// Sending Tool Link
		campaignColumnHelper.accessor("sending_tool_campaign_url", {
			header: "Sending Tool Link",
			cell: (info) => {
				const url = info.getValue();
				if (!url) return "N/A";
				return (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-primary hover:underline"
					>
						View Link
						<ExternalLink className="h-3 w-3" />
					</a>
				);
			},
		}),
	];
};
