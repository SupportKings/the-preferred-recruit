import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { formatLocalDate as format } from "@/lib/date-utils";
import { Edit, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(dateString, "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

// Format relationship for display (e.g., "parent" -> "Parent")
const formatRelationship = (
	relationship: string | null | undefined,
): string => {
	if (!relationship) return "Unknown";

	const relationshipMap: Record<string, string> = {
		parent: "Parent",
		guardian: "Guardian",
		agent: "Agent",
		coach: "Coach",
		trainer: "Trainer",
		advisor: "Advisor",
		family: "Family Member",
		other: "Other",
	};

	return relationshipMap[relationship.toLowerCase()] || relationship;
};

export const createAthleteColumns = () => {
	const athleteColumnHelper = createColumnHelper<any>();
	return [
		// Athlete Name with link to athlete details
		athleteColumnHelper.accessor("athlete.full_name", {
			header: "Athlete Name",
			cell: (info) => {
				const athleteId = info.row.original.athlete?.id;
				const name = info.getValue() || "Unknown";

				if (!athleteId) return name;

				return (
					<Link
						href={`/dashboard/athletes/${athleteId}`}
						className="text-primary hover:underline"
					>
						{name}
					</Link>
				);
			},
		}),

		// Email
		athleteColumnHelper.accessor("athlete.contact_email", {
			header: "Email",
			cell: (info) => info.getValue() || "No email",
		}),

		// Phone
		athleteColumnHelper.accessor("athlete.phone", {
			header: "Phone",
			cell: (info) => info.getValue() || "No phone",
		}),

		// Relationship
		athleteColumnHelper.accessor("relationship", {
			header: "Relationship",
			cell: (info) => formatRelationship(info.getValue()),
		}),

		// Is Primary
		athleteColumnHelper.accessor("is_primary", {
			header: "Primary?",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Primary" : "Secondary"}</StatusBadge>
			),
		}),

		// Start Date
		athleteColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// End Date
		athleteColumnHelper.accessor("end_date", {
			header: "End Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createAthleteRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (athlete: any) => {
			setEditModal({
				isOpen: true,
				type: "athlete",
				data: athlete,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (athlete: any) => {
			setDeleteModal({
				isOpen: true,
				type: "athlete",
				id: athlete.id,
				title: `Delete athlete relationship for ${athlete.athlete?.full_name || "Unknown"}`,
			});
		},
	},
];
