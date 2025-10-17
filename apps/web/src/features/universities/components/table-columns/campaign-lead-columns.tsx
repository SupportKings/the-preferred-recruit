import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

import { InlineStatusCell } from "@/features/universities/components/detail-tabs/inline-status-cell";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, ExternalLink, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

// Format lead status with proper capitalization
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

// Format campaign type with proper capitalization
const formatType = (type: string | null | undefined): string => {
	if (!type) return "—";
	return type
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export const createCampaignLeadColumns = (
	onInlineEdit?: (leadId: string, field: string, value: string | null) => void,
	setDeleteModal?: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void,
	setEditModal?: (modal: { isOpen: boolean; type: string; data: any }) => void,
) => {
	const leadColumnHelper = createColumnHelper<any>();

	return [
		// Campaign Name
		leadColumnHelper.accessor("campaigns.name", {
			header: "Campaign",
			cell: (info) => {
				const campaign = info.row.original.campaigns;
				if (!campaign) return "—";

				const campaignName = info.getValue();
				const campaignId = campaign.id;
				const campaignUrl = campaign.sending_tool_campaign_url;

				if (campaignId) {
					return (
						<div className="flex items-center gap-2">
							<Link
								href={`/dashboard/campaigns/${campaignId}`}
								className="text-primary hover:underline"
							>
								{campaignName || "Unknown Campaign"}
							</Link>
							{campaignUrl && (
								<a
									href={campaignUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-primary"
									title="Campaign URL"
								>
									<ExternalLink className="h-3.5 w-3.5" />
								</a>
							)}
						</div>
					);
				}

				return campaignName || "Unknown Campaign";
			},
		}),

		// Campaign Type
		leadColumnHelper.accessor("campaigns.type", {
			header: "Type",
			cell: (info) => {
				const type = info.getValue();
				return <StatusBadge>{formatType(type)}</StatusBadge>;
			},
		}),

		// Program Gender
		leadColumnHelper.accessor("programs.gender", {
			header: "Program",
			cell: (info) => {
				const program = info.row.original.programs;
				if (!program) return "—";

				const gender = info.getValue();
				const programId = program.id;
				const teamUrl = program.team_url;

				const displayText =
					gender === "men"
						? "Men's Program"
						: gender === "women"
							? "Women's Program"
							: "Program";

				if (programId) {
					return (
						<div className="flex items-center gap-2">
							<Link
								href={`/dashboard/programs/${programId}`}
								className="text-primary hover:underline"
							>
								{displayText}
							</Link>
							{teamUrl && (
								<a
									href={teamUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-primary"
									title="Visit team website"
								>
									<ExternalLink className="h-3.5 w-3.5" />
								</a>
							)}
						</div>
					);
				}

				return displayText;
			},
		}),

		// Coach/Job
		leadColumnHelper.accessor("university_jobs.job_title", {
			header: "Coach/Job",
			cell: (info) => {
				const universityJob = info.row.original.university_jobs;
				if (!universityJob) return "—";

				const jobTitle = info.getValue();
				const coach = universityJob.coaches;
				const coachName = coach?.full_name;
				const coachId = coach?.id;

				return (
					<div className="text-sm">
						{coachName && coachId ? (
							<div className="flex items-center gap-2">
								<Link
									href={`/dashboard/coaches/${coachId}`}
									className="font-medium text-primary hover:underline"
								>
									{coachName}
								</Link>
								{coach.linkedin_profile && (
									<a
										href={coach.linkedin_profile}
										target="_blank"
										rel="noopener noreferrer"
										className="text-muted-foreground hover:text-primary"
										title="Coach profile"
									>
										<ExternalLink className="h-3.5 w-3.5" />
									</a>
								)}
							</div>
						) : (
							<div className="text-muted-foreground">No coach</div>
						)}
						{jobTitle && (
							<div className="text-muted-foreground text-xs">{jobTitle}</div>
						)}
					</div>
				);
			},
		}),

		// Lead Status (inline editable)
		leadColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) => {
				const status = info.getValue();
				const leadId = info.row.original.id;

				if (onInlineEdit) {
					return (
						<InlineStatusCell
							value={status}
							onSave={async (value) => {
								await onInlineEdit(leadId, "status", value);
							}}
							options={[
								{ value: "pending", label: "Pending" },
								{ value: "replied", label: "Replied" },
								{ value: "suppressed", label: "Suppressed" },
							]}
							formatValue={formatStatus}
						/>
					);
				}

				return <StatusBadge>{formatStatus(status)}</StatusBadge>;
			},
		}),

		// First Reply At
		leadColumnHelper.accessor("first_reply_at", {
			header: "First Reply",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Internal Notes
		leadColumnHelper.accessor("internal_notes", {
			header: "Notes",
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

		// Actions
		leadColumnHelper.display({
			id: "actions",
			header: "Actions",
			cell: (info) => {
				const lead = info.row.original;

				return (
					<div className="flex gap-1">
						{setEditModal && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setEditModal({
										isOpen: true,
										type: "campaign_lead",
										data: lead,
									})
								}
							>
								<Edit className="h-4 w-4" />
							</Button>
						)}
						{setDeleteModal && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									const campaignName =
										lead.campaigns?.name || "Unknown Campaign";
									const programGender =
										lead.programs?.gender || "Unknown Program";
									setDeleteModal({
										isOpen: true,
										type: "campaign_lead",
										id: lead.id,
										title: `Delete lead for ${campaignName} - ${programGender}`,
									});
								}}
							>
								<Trash2 className="h-4 w-4 text-red-600" />
							</Button>
						)}
					</div>
				);
			},
		}),
	];
};
