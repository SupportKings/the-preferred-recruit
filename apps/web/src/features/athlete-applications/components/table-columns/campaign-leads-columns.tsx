"use client";

import { useState } from "react";

import Link from "next/link";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { updateCampaignLead } from "@/features/athlete-applications/actions/relations/campaign-leads";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const leadStatuses = ["pending", "replied", "suppressed"];

// Format campaign type to display nicely
const formatCampaignType = (type: string | null | undefined): string => {
	if (!type) return "";

	const typeMap: Record<string, string> = {
		top: "Top",
		second_pass: "Second Pass",
		third_pass: "Third Pass",
		personal_best: "Personal Best",
	};

	return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Component for expandable text in a dialog
function ExpandableTextCell({
	text,
	title,
}: {
	text: string | null;
	title: string;
}) {
	if (!text) return <span className="text-muted-foreground">—</span>;

	return (
		<Dialog>
			<DialogTrigger className="h-auto flex items-center max-w-md justify-start truncate p-0 text-left font-normal hover:bg-transparent hover:underline">
				<Eye className="mr-2 h-3 w-3 flex-shrink-0" />
				<span className="truncate">{text}</span>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<DialogDescription className="whitespace-pre-wrap text-sm">
					{text}
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}

// Component for inline-editable lead status
function InlineEditableLeadStatus({
	leadId,
	initialValue,
}: {
	leadId: string;
	initialValue: string;
}) {
	const [value, setValue] = useState(initialValue);
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = async (newValue: string) => {
		if (newValue === value) return;

		setIsLoading(true);
		try {
			await updateCampaignLead(leadId, { status: newValue });
			setValue(newValue);
			toast.success("Lead status updated");
		} catch (error) {
			console.error("Error updating lead status:", error);
			toast.error("Failed to update lead status");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Select value={value} onValueChange={handleChange} disabled={isLoading}>
			<SelectTrigger className="h-8 w-[140px] border-none bg-transparent hover:bg-accent">
				<SelectValue>
					<StatusBadge>
						{value.charAt(0).toUpperCase() + value.slice(1)}
					</StatusBadge>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{leadStatuses.map((status) => (
					<SelectItem key={status} value={status}>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export const createCampaignLeadsColumns = () => {
	const campaignLeadsColumnHelper = createColumnHelper<any>();
	return [
		campaignLeadsColumnHelper.accessor("campaigns", {
			header: "Campaign",
			cell: (info) => {
				const campaign = info.getValue();
				if (!campaign) return <span className="text-muted-foreground">—</span>;

				const formattedType = formatCampaignType(campaign.type);

				return (
					<Link
						href={`/dashboard/campaigns/${campaign.id}`}
						className="group flex flex-col gap-0.5"
					>
						<span className="font-medium group-hover:underline">
							{campaign.name}
						</span>
						{formattedType && (
							<span className="text-muted-foreground text-xs">
								{formattedType}
							</span>
						)}
					</Link>
				);
			},
		}),
		campaignLeadsColumnHelper.accessor("universities", {
			header: "University",
			cell: (info) => {
				const university = info.getValue();
				if (!university)
					return <span className="text-muted-foreground">—</span>;

				return (
					<Link
						href={`/dashboard/universities/${university.id}`}
						className="group flex flex-col gap-0.5"
					>
						<span className="font-medium group-hover:underline">
							{university.name}
						</span>
						{university.city && (
							<span className="text-muted-foreground text-xs">
								{university.city}
							</span>
						)}
					</Link>
				);
			},
		}),
		campaignLeadsColumnHelper.accessor("programs", {
			header: "Program",
			cell: (info) => {
				const program = info.getValue();
				if (!program) return <span className="text-muted-foreground">—</span>;

				const genderLabel = program.gender
					? `${program.gender.charAt(0).toUpperCase()}${program.gender.slice(1)}'s`
					: "Program";

				return (
					<Link
						href={`/dashboard/programs/${program.id}`}
						className="font-medium hover:underline"
					>
						{genderLabel}
					</Link>
				);
			},
		}),
		campaignLeadsColumnHelper.accessor("university_jobs", {
			header: "Coach/Job",
			cell: (info) => {
				const job = info.getValue();
				if (!job) return <span className="text-muted-foreground">—</span>;

				const jobTitle = job.job_title || "Unknown Position";
				const workEmail = job.work_email;

				// Check if we have coach data to link to
				if (job.coaches?.id) {
					return (
						<Link
							href={`/dashboard/coaches/${job.coaches.id}`}
							className="group flex flex-col gap-0.5"
						>
							<span className="font-medium group-hover:underline">
								{jobTitle}
							</span>
							{workEmail && (
								<span className="text-muted-foreground text-xs">
									{workEmail}
								</span>
							)}
						</Link>
					);
				}

				return (
					<div className="flex flex-col gap-0.5">
						<span className="font-medium">{jobTitle}</span>
						{workEmail && (
							<span className="text-muted-foreground text-xs">{workEmail}</span>
						)}
					</div>
				);
			},
		}),
		campaignLeadsColumnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => {
				const leadId = info.row.original.id;
				const status = info.getValue() || "pending";
				return (
					<InlineEditableLeadStatus leadId={leadId} initialValue={status} />
				);
			},
		}),
		campaignLeadsColumnHelper.accessor("first_reply_at", {
			header: "First Reply At",
			cell: (info) => formatDate(info.getValue()),
		}),
		campaignLeadsColumnHelper.accessor("include_reason", {
			header: "Include Reason",
			cell: (info) => (
				<ExpandableTextCell text={info.getValue()} title="Include Reason" />
			),
		}),
		campaignLeadsColumnHelper.accessor("internal_notes", {
			header: "Internal Notes",
			cell: (info) => (
				<ExpandableTextCell text={info.getValue()} title="Internal Notes" />
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
