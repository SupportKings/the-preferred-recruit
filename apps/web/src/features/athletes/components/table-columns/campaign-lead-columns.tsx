import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { formatLocalDate as format } from "@/lib/date-utils";
import { Edit, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(dateString, "MMM dd, yyyy HH:mm");
	} catch {
		return "Invalid date";
	}
};

// Format lead status
const formatStatus = (status: string | null | undefined): string => {
	if (!status) return "Unknown";

	const statusMap: Record<string, string> = {
		pending: "Pending",
		sent: "Sent",
		replied: "Replied",
		suppressed: "Suppressed",
		bounced: "Bounced",
	};

	return statusMap[status.toLowerCase()] || status;
};

export const createCampaignLeadColumns = () => {
	const leadColumnHelper = createColumnHelper<any>();

	return [
		// Include Reason
		leadColumnHelper.accessor("include_reason", {
			header: "Include Reason",
			cell: (info) => {
				const reason = info.getValue();
				if (!reason) return "—";
				return (
					<div className="max-w-md truncate" title={reason}>
						{reason}
					</div>
				);
			},
		}),

		// Coach (university_job_id lookup: coach name and job title)
		leadColumnHelper.accessor("university_job.coach.full_name", {
			header: "Coach",
			cell: (info) => {
				const universityJob = info.row.original.university_job;

				if (!universityJob) return "—";

				const coachName = info.getValue();
				const jobTitle = universityJob.job_title;
				const coachId = universityJob.coach?.id;
				const universityJobId = universityJob.id;

				// Build display text: "Coach Name – Job Title"
				const parts = [];
				if (coachName) {
					parts.push(coachName);
				}
				if (jobTitle) {
					parts.push(jobTitle);
				}

				if (parts.length === 0) return "—";

				const displayText = parts.join(" – ");

				// Make the whole coach info clickable (navigate to university job or coach)
				const href = universityJobId
					? `/dashboard/university-jobs/${universityJobId}`
					: coachId
						? `/dashboard/coaches/${coachId}`
						: null;

				if (href) {
					return (
						<Link href={href} className="text-primary hover:underline">
							{displayText}
						</Link>
					);
				}

				return displayText;
			},
		}),

		// Lead Status
		leadColumnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => (
				<StatusBadge>{formatStatus(info.getValue())}</StatusBadge>
			),
		}),

		// First Reply At
		leadColumnHelper.accessor("first_reply_at", {
			header: "First Reply At",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Linked Application (application_id lookup: stage, last_interaction_at, scholarship_percent)
		leadColumnHelper.accessor("application.stage", {
			header: "Linked Application",
			cell: (info) => {
				const application = info.row.original.application;

				if (!application) return "—";

				const stage = info.getValue();
				const lastInteraction = application.last_interaction_at;
				const scholarship = application.scholarship_percent;
				const applicationId = application.id;

				const content = (
					<div className="flex flex-col gap-1">
						{stage && (
							<div>
								<StatusBadge>{stage}</StatusBadge>
							</div>
						)}
						{lastInteraction && (
							<div className="text-muted-foreground text-xs">
								Last: {formatDate(lastInteraction)}
							</div>
						)}
						{scholarship != null && (
							<div className="text-muted-foreground text-xs">
								{scholarship}% scholarship
							</div>
						)}
					</div>
				);

				// Make the entire application info clickable
				if (applicationId) {
					return (
						<Link
							href={`/dashboard/athlete-applications/${applicationId}`}
							className="text-primary hover:underline"
						>
							{content}
						</Link>
					);
				}

				return content;
			},
		}),

		// Internal Notes
		leadColumnHelper.accessor("internal_notes", {
			header: "Internal Notes",
			cell: (info) => {
				const notes = info.getValue();
				if (!notes) return "—";
				return (
					<div className="max-w-md truncate" title={notes}>
						{notes}
					</div>
				);
			},
		}),
	];
};

export const createCampaignLeadRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (lead: any) => {
			setEditModal({
				isOpen: true,
				type: "campaign_lead",
				data: lead,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (lead: any) => {
			setDeleteModal({
				isOpen: true,
				type: "campaign_lead",
				id: lead.id,
				title: `Delete lead for ${lead.university_job?.university?.name || "Unknown"}`,
			});
		},
	},
];
