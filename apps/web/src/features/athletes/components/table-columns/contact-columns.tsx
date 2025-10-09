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

export const createContactColumns = () => {
	const contactColumnHelper = createColumnHelper<any>();
	return [
		// Contact Name with link to contact details
		contactColumnHelper.accessor("contact.full_name", {
			header: "Contact Name",
			cell: (info) => {
				const contactId = info.row.original.contact?.id;
				const name = info.getValue() || "Unknown";

				if (!contactId) return name;

				return (
					<Link
						href={`/dashboard/contacts/${contactId}`}
						className="text-primary hover:underline"
					>
						{name}
					</Link>
				);
			},
		}),

		// Email
		contactColumnHelper.accessor("contact.email", {
			header: "Email",
			cell: (info) => info.getValue() || "No email",
		}),

		// Phone
		contactColumnHelper.accessor("contact.phone", {
			header: "Phone",
			cell: (info) => info.getValue() || "No phone",
		}),

		// Relationship
		contactColumnHelper.accessor("relationship", {
			header: "Relationship",
			cell: (info) => formatRelationship(info.getValue()),
		}),

		// Is Primary
		contactColumnHelper.accessor("is_primary", {
			header: "Primary?",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Primary" : "Secondary"}</StatusBadge>
			),
		}),

		// Start Date
		contactColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// End Date
		contactColumnHelper.accessor("end_date", {
			header: "End Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createContactRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (contact: any) => {
			setEditModal({
				isOpen: true,
				type: "contact",
				data: contact,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (contact: any) => {
			setDeleteModal({
				isOpen: true,
				type: "contact",
				id: contact.id,
				title: `Delete contact for ${contact.contact?.full_name || "Unknown"}`,
			});
		},
	},
];
