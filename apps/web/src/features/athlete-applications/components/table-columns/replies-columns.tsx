import { createColumnHelper } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

export const createRepliesColumns = () => {
	const repliesColumnHelper = createColumnHelper<any>();
	return [
		repliesColumnHelper.accessor("type", {
			header: "Reply Type",
			cell: (info) => (
				<StatusBadge>
					{info.getValue()
						? info.getValue().charAt(0).toUpperCase() +
							info.getValue().slice(1)
						: "Unknown"}
				</StatusBadge>
			),
		}),
		repliesColumnHelper.accessor("occurred_at", {
			header: "Occurred At",
			cell: (info) => formatDate(info.getValue()),
		}),
		repliesColumnHelper.accessor("summary", {
			header: "Summary",
			cell: (info) => (
				<div className="max-w-md truncate">{info.getValue() || "—"}</div>
			),
		}),
		repliesColumnHelper.accessor("campaigns", {
			header: "Campaign",
			cell: (info) => {
				const campaign = info.getValue();
				return campaign
					? `${campaign.name} (${campaign.type})`
					: "—";
			},
		}),
		repliesColumnHelper.accessor("university_jobs", {
			header: "Coach",
			cell: (info) => {
				const job = info.getValue();
				return job
					? `${job.coaches?.full_name || "Unknown"} - ${job.job_title}`
					: "—";
			},
		}),
	];
};

export const createRepliesRowActions = (
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
				title: `Delete reply from ${formatDate(reply.occurred_at)}`,
			});
		},
	},
];
