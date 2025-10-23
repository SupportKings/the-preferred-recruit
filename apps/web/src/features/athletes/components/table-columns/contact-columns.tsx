"use client";

import { useState } from "react";

import Link from "next/link";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { updateAthleteContact } from "@/features/contacts/actions/relations/contactAthletes";

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

// Inline edit component for Primary status
function InlinePrimaryCell({
	contactAthleteId,
	currentIsPrimary,
}: {
	contactAthleteId: string;
	currentIsPrimary: boolean;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [isPrimary, setIsPrimary] = useState(currentIsPrimary);
	const [isUpdating, setIsUpdating] = useState(false);

	const handlePrimaryChange = async (newValue: string) => {
		const newIsPrimary = newValue === "true";

		if (newIsPrimary === isPrimary) {
			setIsEditing(false);
			return;
		}

		setIsUpdating(true);
		try {
			await updateAthleteContact(contactAthleteId, {
				is_primary: newIsPrimary,
			});
			setIsPrimary(newIsPrimary);
			toast.success(
				newIsPrimary ? "Set as primary contact" : "Set as secondary contact",
			);
		} catch (error) {
			console.error("Failed to update primary status:", error);
			toast.error("Failed to update primary status");
		} finally {
			setIsUpdating(false);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<Select
				value={isPrimary.toString()}
				onValueChange={handlePrimaryChange}
				disabled={isUpdating}
				open={isEditing}
				onOpenChange={setIsEditing}
			>
				<SelectTrigger className="h-8 w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="true">Primary</SelectItem>
					<SelectItem value="false">Secondary</SelectItem>
				</SelectContent>
			</Select>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setIsEditing(true)}
			className="cursor-pointer transition-opacity hover:opacity-70"
		>
			<StatusBadge>{isPrimary ? "Primary" : "Secondary"}</StatusBadge>
		</button>
	);
}

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

		// Is Primary - with inline edit
		contactColumnHelper.accessor("is_primary", {
			header: "Primary?",
			cell: (info) => (
				<InlinePrimaryCell
					contactAthleteId={info.row.original.id}
					currentIsPrimary={info.getValue() || false}
				/>
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
		label: "View",
		icon: Eye,
		onClick: (contact: any) => {
			window.location.href = `/dashboard/contacts/${contact.contact?.id}`;
		},
	},
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
