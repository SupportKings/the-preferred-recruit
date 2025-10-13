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

export const createCampaignLeadsColumns = () => {
	const campaignLeadsColumnHelper = createColumnHelper<any>();
	return [
		campaignLeadsColumnHelper.accessor("campaigns", {
			header: "Campaign",
			cell: (info) => {
				const campaign = info.getValue();
				return campaign
					? `${campaign.name} (${campaign.type})`
					: "Unknown";
			},
		}),
		campaignLeadsColumnHelper.accessor("universities", {
			header: "University",
			cell: (info) => {
				const university = info.getValue();
				return university
					? `${university.name}${university.city ? `, ${university.city}` : ""}`
					: "—";
			},
		}),
		campaignLeadsColumnHelper.accessor("programs", {
			header: "Program",
			cell: (info) => {
				const program = info.getValue();
				return program
					? `${program.gender?.charAt(0).toUpperCase()}${program.gender?.slice(1)}'s`
					: "—";
			},
		}),
		campaignLeadsColumnHelper.accessor("university_jobs", {
			header: "Coach/Job",
			cell: (info) => {
				const job = info.getValue();
				return job ? `${job.job_title} (${job.work_email})` : "—";
			},
		}),
		campaignLeadsColumnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => (
				<StatusBadge>
					{info.getValue()
						? info.getValue().charAt(0).toUpperCase() +
							info.getValue().slice(1)
						: "Unknown"}
				</StatusBadge>
			),
		}),
		campaignLeadsColumnHelper.accessor("first_reply_at", {
			header: "First Reply At",
			cell: (info) => formatDate(info.getValue()),
		}),
		campaignLeadsColumnHelper.accessor("include_reason", {
			header: "Include Reason",
			cell: (info) => (
				<div className="max-w-md truncate">{info.getValue() || "—"}</div>
			),
		}),
	];
};

export const createCampaignLeadsRowActions = (
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
				title: `Delete campaign lead for ${lead.campaigns?.name || "Unknown Campaign"}`,
			});
		},
	},
];
