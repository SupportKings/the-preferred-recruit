"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { IncludeReasonCell } from "./include-reason-cell";
import { InlineStatusCell } from "./inline-status-cell-campaign-lead";
import { InternalNotesCell } from "./internal-notes-cell";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

export const createCampaignLeadColumns = (leadListId?: string) => {
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

		// Target University
		campaignLeadColumnHelper.accessor("university.name", {
			header: "Target University",
			cell: (info) => {
				const university = info.row.original.university;
				const city = university?.city;

				if (!university?.id) {
					return (
						<div className="flex flex-col">
							<span>{info.getValue() || "Unknown"}</span>
							{city && (
								<span className="text-muted-foreground text-xs">{city}</span>
							)}
						</div>
					);
				}

				return (
					<div className="flex flex-col">
						<Link
							href={`/dashboard/universities/${university.id}`}
							className="flex items-center gap-1 text-primary hover:underline"
						>
							{info.getValue() || "Unknown"}
							<ExternalLink className="h-3 w-3" />
						</Link>
						{city && (
							<span className="text-muted-foreground text-xs">{city}</span>
						)}
					</div>
				);
			},
		}),

		// Target Program
		campaignLeadColumnHelper.accessor("program.gender", {
			header: "Target Program",
			cell: (info) => {
				const program = info.row.original.program;
				const gender = info.getValue();

				if (!gender) return "Not specified";
				const displayGender = gender === "mens" ? "Men's" : "Women's";

				if (!program?.id) {
					return displayGender;
				}

				return (
					<Link
						href={`/dashboard/programs/${program.id}`}
						className="flex items-center gap-1 text-primary hover:underline"
					>
						{displayGender}
						<ExternalLink className="h-3 w-3" />
					</Link>
				);
			},
		}),

		// Coach
		campaignLeadColumnHelper.accessor("university_job.job_title", {
			header: "Coach",
			cell: (info) => {
				const job = info.row.original.university_job;
				const jobTitle = info.getValue();
				const email = job?.work_email;
				const coachId = job?.coach?.id || job?.coach_id;

				if (!jobTitle) {
					return "Not specified";
				}

				if (!coachId) {
					return (
						<div className="flex flex-col">
							<span>{jobTitle}</span>
							{email && (
								<span className="text-muted-foreground text-xs">{email}</span>
							)}
						</div>
					);
				}

				return (
					<div className="flex flex-col">
						<Link
							href={`/dashboard/coaches/${coachId}`}
							className="flex items-center gap-1 text-primary hover:underline"
						>
							{jobTitle}
							<ExternalLink className="h-3 w-3" />
						</Link>
						{email && (
							<span className="text-muted-foreground text-xs">{email}</span>
						)}
					</div>
				);
			},
		}),

		// Status (Inline Editable)
		campaignLeadColumnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => {
				const leadId = info.row.original.id;
				const currentStatus = info.getValue();

				if (!leadListId) {
					return <StatusBadge>{currentStatus}</StatusBadge>;
				}

				return (
					<InlineStatusCell
						leadId={leadId}
						currentStatus={currentStatus}
						leadListId={leadListId}
					/>
				);
			},
		}),

		// First Reply At
		campaignLeadColumnHelper.accessor("first_reply_at", {
			header: "First Reply At",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Include Reason (with popup dialog)
		campaignLeadColumnHelper.accessor("include_reason", {
			header: "Include Reason",
			cell: (info) => {
				const reason = info.getValue();
				const universityName = info.row.original.university?.name;
				return (
					<IncludeReasonCell reason={reason} universityName={universityName} />
				);
			},
		}),

		// Internal Notes
		campaignLeadColumnHelper.accessor("internal_notes", {
			header: "Internal Notes",
			cell: (info) => {
				const notes = info.getValue();
				const universityName = info.row.original.university?.name;
				return (
					<InternalNotesCell notes={notes} universityName={universityName} />
				);
			},
		}),
	];
};
