import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

// Helper function to format lead list type for display
const formatLeadListType = (type?: string): string => {
	if (!type) return "N/A";
	const typeMap: Record<string, string> = {
		d1: "Division I",
		d2: "Division II",
		d3: "Division III",
		naia: "NAIA",
		juco: "Junior College",
		reach: "Reach Schools",
		target: "Target Schools",
		safety: "Safety Schools",
	};
	return typeMap[type] || type;
};

export const createLeadListColumns = () => {
	const leadListColumnHelper = createColumnHelper<any>();
	return [
		// Name (with link to details)
		leadListColumnHelper.accessor("name", {
			header: "List Name",
			cell: (info) => {
				const leadListId = info.row.original.id;
				const name = info.getValue() || "Unnamed List";
				return (
					<Link
						href={`/dashboard/school-lead-lists/${leadListId}`}
						className="text-primary hover:underline"
					>
						{name}
					</Link>
				);
			},
		}),

		// Priority
		leadListColumnHelper.accessor("priority", {
			header: "Priority",
			cell: (info) => {
				const priority = info.getValue();
				return priority ?? "N/A";
			},
		}),

		// Type
		leadListColumnHelper.accessor("type", {
			header: "Type",
			cell: (info) => (
				<StatusBadge>{formatLeadListType(info.getValue())}</StatusBadge>
			),
		}),

		// Season Label
		leadListColumnHelper.accessor("season_label", {
			header: "Season",
			cell: (info) => info.getValue() || "N/A",
		}),
	];
};

export const createLeadListRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (leadList: any) => {
			setEditModal({
				isOpen: true,
				type: "leadList",
				data: leadList,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (leadList: any) => {
			setDeleteModal({
				isOpen: true,
				type: "leadList",
				id: leadList.id,
				title: `Delete lead list "${leadList.name || "Unnamed List"}"`,
			});
		},
	},
];
