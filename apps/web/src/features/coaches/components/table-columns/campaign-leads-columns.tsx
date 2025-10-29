import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatProgramGender = (gender: string | null) => {
	if (!gender) return "N/A";
	const genderLower = gender.toLowerCase();
	if (genderLower === "men") return "Men's Program";
	if (genderLower === "women") return "Women's Program";
	return gender;
};

const formatLeadListType = (type: string | null) => {
	if (!type) return "";
	// Convert snake_case or lowercase to Title Case
	return type
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

type CampaignLeadRow = {
	id: string;
	campaign_id: string | null;
	include_reason: string | null;
	included_at: string | null;
	status: string | null;
	first_reply_at: string | null;
	internal_notes: string | null;
	campaigns?: {
		id: string | null;
		name: string | null;
		type: string | null;
		status: string | null;
	} | null;
	school_lead_lists?: {
		id: string | null;
		name: string | null;
		type: string | null;
		priority: number | null;
	} | null;
	universities?: {
		id: string | null;
		name: string | null;
		city: string | null;
		region: string | null;
	} | null;
	programs?: {
		id: string | null;
		gender: string | null;
	} | null;
	university_jobs?: {
		job_title: string | null;
		work_email: string | null;
	} | null;
	athlete_applications?: {
		stage: string | null;
		last_interaction_at: string | null;
	} | null;
};

export const createCampaignLeadsColumns = (
	onEdit?: (lead: CampaignLeadRow) => void,
	onDelete?: (lead: CampaignLeadRow) => void,
) => {
	const columnHelper = createColumnHelper<CampaignLeadRow>();
	const columns: any[] = [
		columnHelper.accessor("campaigns.name", {
			header: "Campaign",
			cell: (info) => {
				const campaignName =
					info.getValue() || info.row.original.campaigns?.name || "Unknown";
				const campaignId =
					info.row.original.campaign_id || info.row.original.campaigns?.id;

				if (!campaignId) {
					return <span>{campaignName}</span>;
				}

				return (
					<div className="flex items-center gap-2">
						<a
							href={`/dashboard/campaigns/${campaignId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{campaignName}
						</a>
						<a
							href={`/dashboard/campaigns/${campaignId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80"
							onClick={(e) => e.stopPropagation()}
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				);
			},
		}),
		columnHelper.accessor("campaigns.type", {
			header: "Type",
			cell: (info) => (
				<StatusBadge>
					{info.getValue() || info.row.original.campaigns?.type || "N/A"}
				</StatusBadge>
			),
		}),
		columnHelper.accessor("campaigns.status", {
			header: "Campaign Status",
			cell: (info) => (
				<StatusBadge>
					{info.getValue() || info.row.original.campaigns?.status || "N/A"}
				</StatusBadge>
			),
		}),
		columnHelper.accessor("school_lead_lists.name", {
			header: "Lead List",
			cell: (info) => {
				const leadListName =
					info.getValue() || info.row.original.school_lead_lists?.name;
				const leadListId = info.row.original.school_lead_lists?.id;
				const leadListType = info.row.original.school_lead_lists?.type;

				if (!leadListId || !leadListName) {
					return <span>{leadListName || "Unknown"}</span>;
				}

				return (
					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<a
								href={`/dashboard/school-lead-lists/${leadListId}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
								onClick={(e) => e.stopPropagation()}
							>
								{leadListName}
							</a>
							<a
								href={`/dashboard/school-lead-lists/${leadListId}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:text-primary/80"
								onClick={(e) => e.stopPropagation()}
							>
								<ExternalLink className="h-4 w-4" />
							</a>
						</div>
						{leadListType && (
							<span className="text-muted-foreground text-xs">
								{formatLeadListType(leadListType)}
							</span>
						)}
					</div>
				);
			},
		}),
		columnHelper.accessor("universities.name", {
			header: "University",
			cell: (info) => {
				const universityName =
					info.getValue() || info.row.original.universities?.name || "Unknown";
				const universityId = info.row.original.universities?.id;

				if (!universityId) {
					return <span>{universityName}</span>;
				}

				return (
					<div className="flex items-center gap-2">
						<a
							href={`/dashboard/universities/${universityId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{universityName}
						</a>
						<a
							href={`/dashboard/universities/${universityId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80"
							onClick={(e) => e.stopPropagation()}
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				);
			},
		}),
		columnHelper.accessor("programs.gender", {
			header: "Program",
			cell: (info) => {
				const programGender =
					info.getValue() || info.row.original.programs?.gender;
				const programId = info.row.original.programs?.id;
				const formattedProgram = formatProgramGender(programGender ?? null);

				if (!programId) {
					return <span>{formattedProgram}</span>;
				}

				return (
					<div className="flex items-center gap-2">
						<a
							href={`/dashboard/programs/${programId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{formattedProgram}
						</a>
						<a
							href={`/dashboard/programs/${programId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80"
							onClick={(e) => e.stopPropagation()}
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				);
			},
		}),
		columnHelper.accessor("university_jobs.job_title", {
			header: "Job Title",
			cell: (info) =>
				info.getValue() ||
				info.row.original.university_jobs?.job_title ||
				"N/A",
		}),
		columnHelper.accessor("status", {
			header: "Lead Status",
			cell: (info) => <StatusBadge>{info.getValue() || "Unknown"}</StatusBadge>,
		}),
		columnHelper.accessor("included_at", {
			header: "Included At",
			cell: (info) => formatDate(info.getValue()),
		}),
		columnHelper.accessor("first_reply_at", {
			header: "First Reply",
			cell: (info) => formatDate(info.getValue()),
		}),
	];

	if (onEdit || onDelete) {
		columns.push(
			columnHelper.display({
				id: "actions",
				header: "",
				cell: (info) => (
					<div className="flex items-center gap-2">
						{onEdit && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onEdit(info.row.original);
								}}
								className="text-muted-foreground hover:text-foreground"
								aria-label="Edit"
							>
								<Pencil className="h-4 w-4" />
							</button>
						)}
						{onDelete && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onDelete(info.row.original);
								}}
								className="text-destructive hover:text-destructive/80"
								aria-label="Delete"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						)}
					</div>
				),
			}),
		);
	}

	return columns;
};

export const createCampaignLeadsRowActions = (
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void,
) => [
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (lead: CampaignLeadRow) => {
			setDeleteModal({
				isOpen: true,
				type: "campaign_lead",
				id: lead.id,
				title: `Delete lead for ${lead.campaigns?.name || "Unknown Campaign"}`,
			});
		},
	},
];
