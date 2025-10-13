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
		// Campaign Name
		leadColumnHelper.accessor("campaign.name", {
			header: "Campaign",
			cell: (info) => info.getValue() || "Unknown Campaign",
		}),

		// University Name
		leadColumnHelper.accessor("university_job.university.name", {
			header: "University",
			cell: (info) => {
				const universityId = info.row.original.university_job?.university?.id;
				const name = info.getValue() || "Unknown";

				if (!universityId) return name;

				return (
					<Link
						href={`/dashboard/universities/${universityId}`}
						className="text-primary hover:underline"
					>
						{name}
					</Link>
				);
			},
		}),

		// Program Gender
		leadColumnHelper.accessor("university_job.program.gender", {
			header: "Program",
			cell: (info) => {
				const gender = info.getValue();
				if (!gender) return "N/A";
				return gender === "men"
					? "Men's"
					: gender === "women"
						? "Women's"
						: gender;
			},
		}),

		// Coach/Job
		leadColumnHelper.accessor("university_job.job_title", {
			header: "Coach",
			cell: (info) => info.getValue() || "N/A",
		}),

		// Lead Status
		leadColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) => (
				<StatusBadge>{formatStatus(info.getValue())}</StatusBadge>
			),
		}),

		// First Reply At
		leadColumnHelper.accessor("first_reply_at", {
			header: "First Reply",
			cell: (info) => formatDate(info.getValue()),
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
