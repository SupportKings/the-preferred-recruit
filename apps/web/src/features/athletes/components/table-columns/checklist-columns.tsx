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

export const createChecklistColumns = () => {
	const checklistColumnHelper = createColumnHelper<any>();
	return [
		// Title
		checklistColumnHelper.accessor("title", {
			header: "Title",
			cell: (info) => info.getValue() || "Untitled",
		}),

		// Description
		checklistColumnHelper.accessor("description", {
			header: "Description",
			cell: (info) => {
				const desc = info.getValue();
				if (!desc) return "No description";
				return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc;
			},
		}),

		// Required
		checklistColumnHelper.accessor("required", {
			header: "Required",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Required" : "Optional"}</StatusBadge>
			),
		}),

		// Applicable
		checklistColumnHelper.accessor("is_applicable", {
			header: "Applicable",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Yes" : "N/A"}</StatusBadge>
			),
		}),

		// Done
		checklistColumnHelper.accessor("is_done", {
			header: "Status",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Complete" : "Pending"}</StatusBadge>
			),
		}),

		// Done At
		checklistColumnHelper.accessor("done_at", {
			header: "Completed",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Sort Order
		checklistColumnHelper.accessor("sort_order", {
			header: "Order",
			cell: (info) => info.getValue() ?? "N/A",
		}),
	];
};

export const createChecklistRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (item: any) => {
			setEditModal({
				isOpen: true,
				type: "checklist",
				data: item,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (item: any) => {
			setDeleteModal({
				isOpen: true,
				type: "checklist",
				id: item.id,
				title: `Delete checklist item "${item.title || "Untitled"}"`,
			});
		},
	},
];
