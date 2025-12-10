import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { formatLocalDate as format } from "@/lib/date-utils";
import { Edit, Eye, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(dateString, "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

// Format stage for display
const formatStage = (stage: string | null | undefined): string => {
	if (!stage) return "Unknown";

	const stageMap: Record<string, string> = {
		intro: "Introduction",
		ongoing: "Ongoing",
		visit: "Visit",
		offer: "Offer Received",
		committed: "Committed",
		dropped: "Dropped",
	};

	return stageMap[stage.toLowerCase()] || stage;
};

export const createApplicationColumns = () => {
	const applicationColumnHelper = createColumnHelper<any>();
	return [
		// University Name with acceptance rate - clickable
		applicationColumnHelper.accessor("university.name", {
			header: "University",
			cell: (info) => {
				const university = info.row.original.university;
				const universityId = university?.id;
				const name = info.getValue() || "Unknown";
				const acceptanceRate = university?.acceptance_rate_pct;

				if (!universityId) {
					return (
						<div>
							<div className="font-medium">{name}</div>
							{acceptanceRate && (
								<div className="text-muted-foreground text-xs">
									{acceptanceRate}% acceptance
								</div>
							)}
						</div>
					);
				}

				return (
					<Link
						href={`/dashboard/universities/${universityId}`}
						className="text-primary hover:underline"
					>
						<div className="font-medium">{name}</div>
						{acceptanceRate && (
							<div className="text-muted-foreground text-xs">
								{acceptanceRate}% acceptance
							</div>
						)}
					</Link>
				);
			},
		}),

		// University City
		applicationColumnHelper.accessor("university.city", {
			header: "City",
			cell: (info) => info.getValue() || "N/A",
		}),

		// Program Gender
		applicationColumnHelper.accessor("program.gender", {
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

		// Stage with badge
		applicationColumnHelper.accessor("stage", {
			header: "Stage",
			cell: (info) => <StatusBadge>{formatStage(info.getValue())}</StatusBadge>,
		}),

		// Start Date
		applicationColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Scholarship Percentage
		applicationColumnHelper.accessor("scholarship_percent", {
			header: "Scholarship %",
			cell: (info) => {
				const percent = info.getValue();
				return percent ? `${percent}%` : "N/A";
			},
		}),

		// Last Interaction
		applicationColumnHelper.accessor("last_interaction_at", {
			header: "Last Contact",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createApplicationRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "View",
		icon: Eye,
		onClick: (application: any) => {
			// Navigate to application detail page
			window.location.href = `/dashboard/athlete-applications/${application.id}`;
		},
	},
	{
		label: "Edit",
		icon: Edit,
		onClick: (application: any) => {
			setEditModal({
				isOpen: true,
				type: "application",
				data: application,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (application: any) => {
			setDeleteModal({
				isOpen: true,
				type: "application",
				id: application.id,
				title: `Delete offer for ${application.university?.name || "Unknown"}`,
			});
		},
	},
];
