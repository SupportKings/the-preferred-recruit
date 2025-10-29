import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy HH:mm");
	} catch {
		return "Invalid date";
	}
};

// Format reply type for display
const formatType = (type: string | null | undefined): string => {
	if (!type) return "Unknown";

	const typeMap: Record<string, string> = {
		email: "Email",
		call: "Phone Call",
		text: "Text/SMS",
		instagram: "Instagram",
		ig: "Instagram",
		other: "Other",
	};

	return typeMap[type.toLowerCase()] || type;
};

export const createReplyColumns = () => {
	const replyColumnHelper = createColumnHelper<any>();
	return [
		// Reply Type
		replyColumnHelper.accessor("type", {
			header: "Type",
			cell: (info) => <StatusBadge>{formatType(info.getValue())}</StatusBadge>,
		}),

		// Occurred At
		replyColumnHelper.accessor("occurred_at", {
			header: "Occurred at",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Summary
		replyColumnHelper.accessor("summary", {
			header: "Summary",
			cell: (info) => {
				const summary = info.getValue();
				if (!summary) return "No summary";
				return summary.length > 60 ? `${summary.substring(0, 60)}...` : summary;
			},
		}),

		// Coach/Job (university_job_id lookup: coach name and job title)
		replyColumnHelper.accessor("university_job.coach.full_name", {
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

		// Application (application_id lookup: stage, last_interaction_at)
		replyColumnHelper.accessor("application.stage", {
			header: "Application",
			cell: (info) => {
				const application = info.row.original.application;

				if (!application) return "—";

				const stage = info.getValue();
				const lastInteraction = application.last_interaction_at;
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

		// Athlete
		replyColumnHelper.accessor("athlete.full_name", {
			header: "Athlete",
			cell: (info) => {
				const fullName = info.getValue();
				const email = info.row.original.athlete?.contact_email;
				return fullName || email || "N/A";
			},
		}),

		// Internal Notes
		replyColumnHelper.accessor("internal_notes", {
			header: "Internal Notes",
			cell: (info) => {
				const notes = info.getValue();
				if (!notes) return "—";
				return notes.length > 50 ? `${notes.substring(0, 50)}...` : notes;
			},
		}),
	];
};

export const createReplyRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (reply: any) => {
			setEditModal({
				isOpen: true,
				type: "reply",
				data: reply,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (reply: any) => {
			setDeleteModal({
				isOpen: true,
				type: "reply",
				id: reply.id,
				title: `Delete ${formatType(reply.type)} reply`,
			});
		},
	},
];
