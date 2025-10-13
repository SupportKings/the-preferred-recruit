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

export const createCampaignLeadColumns = () => {
	const campaignLeadColumnHelper = createColumnHelper<any>();
	return [
		// Campaign
		campaignLeadColumnHelper.accessor("campaign.name", {
			header: "Campaign",
			cell: (info) => {
				const campaignId = info.row.original.campaign_id;
				const campaignName = info.getValue();
				return (
					<div className="flex flex-col">
						<Link
							href={`/dashboard/campaigns/${campaignId}`}
							className="flex items-center gap-1 text-primary hover:underline"
						>
							{campaignName || "Unknown Campaign"}
							<ExternalLink className="h-3 w-3" />
						</Link>
						{info.row.original.campaign?.type && (
							<span className="text-muted-foreground text-xs">
								{info.row.original.campaign.type}
							</span>
						)}
					</div>
				);
			},
		}),

		// University
		campaignLeadColumnHelper.accessor("university.name", {
			header: "University",
			cell: (info) => {
				const city = info.row.original.university?.city;
				return (
					<div className="flex flex-col">
						<span>{info.getValue() || "Unknown"}</span>
						{city && <span className="text-muted-foreground text-xs">{city}</span>}
					</div>
				);
			},
		}),

		// Program
		campaignLeadColumnHelper.accessor("program.gender", {
			header: "Program",
			cell: (info) => {
				const gender = info.getValue();
				if (!gender) return "Not specified";
				return gender === "mens" ? "Men's" : "Women's";
			},
		}),

		// Coach
		campaignLeadColumnHelper.accessor("university_job.job_title", {
			header: "Coach",
			cell: (info) => {
				const jobTitle = info.getValue();
				const email = info.row.original.university_job?.work_email;
				return (
					<div className="flex flex-col">
						<span>{jobTitle || "Not specified"}</span>
						{email && (
							<span className="text-muted-foreground text-xs">{email}</span>
						)}
					</div>
				);
			},
		}),

		// Status
		campaignLeadColumnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
		}),

		// First Reply At
		campaignLeadColumnHelper.accessor("first_reply_at", {
			header: "First Reply",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};
