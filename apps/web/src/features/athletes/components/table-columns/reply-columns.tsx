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
			header: "When",
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

		// Coach/Job
		replyColumnHelper.accessor("university_job.job_title", {
			header: "Coach",
			cell: (info) => {
				const jobTitle = info.getValue();
				const email = info.row.original.university_job?.work_email;
				return jobTitle || email || "N/A";
			},
		}),

		// Campaign
		replyColumnHelper.accessor("campaign.name", {
			header: "Campaign",
			cell: (info) => info.getValue() || "N/A",
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
