import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
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
	const repliesColumnHelper = createColumnHelper<{
		id: string;
		type: string | null;
		occurred_at: string | null;
		summary: string | null;
		internal_notes: string | null;
		campaigns: {
			id: string;
			name: string | null;
			type: string | null;
		} | null;
		athlete_applications: {
			id: string;
			stage: string | null;
			last_interaction_at: string | null;
		} | null;
		athletes: {
			id: string;
			full_name: string;
			contact_email: string | null;
		} | null;
	}>();

	return [
		repliesColumnHelper.accessor("type", {
			header: "Reply Type",
			cell: (info) => (
				<StatusBadge className="capitalize">
					{info.getValue() || "unknown"}
				</StatusBadge>
			),
		}),
		repliesColumnHelper.accessor("occurred_at", {
			header: "Occurred At",
			cell: (info) => formatDate(info.getValue()),
		}),
		repliesColumnHelper.accessor("summary", {
			header: "Summary",
			cell: (info) => {
				const summary = info.getValue();
				if (!summary) return "-";
				return (
					<span className="max-w-[300px] truncate" title={summary}>
						{summary}
					</span>
				);
			},
		}),
		repliesColumnHelper.accessor("campaigns.name", {
			header: "Campaign",
			cell: (info) => {
				const campaignId = info.row.original.campaigns?.id;
				const campaignName = info.getValue() || "-";

				if (!campaignId || campaignName === "-") return campaignName;

				return (
					<Link
						href={`/dashboard/campaigns/${campaignId}`}
						className="text-primary underline-offset-4 hover:underline"
					>
						{campaignName}
					</Link>
				);
			},
		}),
		repliesColumnHelper.accessor("campaigns.type", {
			header: "Campaign Type",
			cell: (info) => (
				<span className="capitalize">{info.getValue() || "-"}</span>
			),
		}),
		repliesColumnHelper.accessor("athlete_applications.stage", {
			header: "Application Stage",
			cell: (info) => (
				<StatusBadge className="capitalize">
					{info.getValue() || "unknown"}
				</StatusBadge>
			),
		}),
		repliesColumnHelper.accessor("athletes.full_name", {
			header: "Athlete",
			cell: (info) => {
				const athleteId = info.row.original.athletes?.id;
				const athleteName = info.getValue() || "-";

				if (!athleteId || athleteName === "-") return athleteName;

				return (
					<Link
						href={`/dashboard/athletes/${athleteId}`}
						className="text-primary underline-offset-4 hover:underline"
					>
						{athleteName}
					</Link>
				);
			},
		}),
		repliesColumnHelper.accessor("athletes.contact_email", {
			header: "Athlete Email",
			cell: (info) => {
				const email = info.getValue();
				if (!email) return "-";
				return (
					<span className="max-w-[200px] truncate" title={email}>
						{email}
					</span>
				);
			},
		}),
	];
};

export const createRepliesRowActions = (
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void,
	setEditModal: (modal: {
		isOpen: boolean;
		type: string;
		data: unknown;
	}) => void,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (reply: { id: string; type: string | null }) => {
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
		onClick: (reply: { id: string; type: string | null }) => {
			setDeleteModal({
				isOpen: true,
				type: "reply",
				id: reply.id,
				title: `Delete ${reply.type || "unknown"} reply`,
			});
		},
	},
];
