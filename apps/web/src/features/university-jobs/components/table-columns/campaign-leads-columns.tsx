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

export const createCampaignLeadsColumns = () => {
	const campaignLeadsColumnHelper = createColumnHelper<{
		id: string;
		status: string | null;
		first_reply_at: string | null;
		include_reason: string | null;
		internal_notes: string | null;
		campaigns: {
			id: string;
			name: string | null;
			type: string | null;
			status: string | null;
		} | null;
		universities: {
			id: string;
			name: string | null;
			city: string | null;
		} | null;
		programs: {
			id: string;
			gender: string | null;
		} | null;
	}>();

	return [
		campaignLeadsColumnHelper.accessor("campaigns.name", {
			header: "Campaign",
			cell: (info) => {
				const campaignId = info.row.original.campaigns?.id;
				const campaignName = info.getValue() || "Unknown Campaign";

				if (!campaignId) return campaignName;

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
		campaignLeadsColumnHelper.accessor("campaigns.type", {
			header: "Campaign Type",
			cell: (info) => (
				<span className="capitalize">{info.getValue() || "-"}</span>
			),
		}),
		campaignLeadsColumnHelper.accessor("campaigns.status", {
			header: "Campaign Status",
			cell: (info) => <StatusBadge>{info.getValue() || "unknown"}</StatusBadge>,
		}),
		campaignLeadsColumnHelper.accessor("universities.name", {
			header: "University",
			cell: (info) => {
				const universityId = info.row.original.universities?.id;
				const universityName = info.getValue() || "-";

				if (!universityId || universityName === "-") return universityName;

				return (
					<Link
						href={`/dashboard/universities/${universityId}`}
						className="text-primary underline-offset-4 hover:underline"
					>
						{universityName}
					</Link>
				);
			},
		}),
		campaignLeadsColumnHelper.accessor("programs.gender", {
			header: "Program",
			cell: (info) => {
				const programId = info.row.original.programs?.id;
				const gender = info.getValue();
				const programLabel = gender ? (
					<span className="capitalize">{gender}</span>
				) : (
					"-"
				);

				if (!programId || !gender) return programLabel;

				return (
					<Link
						href={`/dashboard/programs/${programId}`}
						className="text-primary underline-offset-4 hover:underline"
					>
						{programLabel}
					</Link>
				);
			},
		}),
		campaignLeadsColumnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => <StatusBadge>{info.getValue() || "pending"}</StatusBadge>,
		}),
		campaignLeadsColumnHelper.accessor("first_reply_at", {
			header: "First Reply At",
			cell: (info) => formatDate(info.getValue()),
		}),
		campaignLeadsColumnHelper.accessor("include_reason", {
			header: "Include Reason",
			cell: (info) => {
				const reason = info.getValue();
				if (!reason) return "-";
				return (
					<span className="max-w-[200px] truncate" title={reason}>
						{reason}
					</span>
				);
			},
		}),
	];
};

export const createCampaignLeadsRowActions = (
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
		onClick: (lead: {
			id: string;
			campaigns: { name: string | null } | null;
		}) => {
			setEditModal({
				isOpen: true,
				type: "campaign-lead",
				data: lead,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (lead: {
			id: string;
			campaigns: { name: string | null } | null;
		}) => {
			setDeleteModal({
				isOpen: true,
				type: "campaign-lead",
				id: lead.id,
				title: `Delete campaign lead for ${lead.campaigns?.name || "Unknown"}`,
			});
		},
	},
];
