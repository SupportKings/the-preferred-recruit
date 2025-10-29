import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { InlineStatusCell } from "./inline-status-cell";
import { InternalNotesCell } from "./internal-notes-cell";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

export const createEntryColumns = (leadListId: string) => {
	const entryColumnHelper = createColumnHelper<any>();
	return [
		// University
		entryColumnHelper.accessor("university.name", {
			header: "University",
			cell: (info) =>
				info.getValue() || info.row.original.university?.name || "Unknown",
		}),

		// City
		entryColumnHelper.accessor("university.city", {
			header: "City",
			cell: (info) => info.getValue() || "N/A",
		}),

		// Program
		entryColumnHelper.accessor("program.gender", {
			header: "Program",
			cell: (info) => {
				const gender = info.getValue();
				if (!gender) return "Not specified";
				return gender === "mens" ? "Men's" : "Women's";
			},
		}),

		// Status (inline editable)
		entryColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) => (
				<InlineStatusCell
					entryId={info.row.original.id}
					currentStatus={info.getValue()}
					leadListId={leadListId}
				/>
			),
		}),

		// Internal Notes (clickable with popup)
		entryColumnHelper.accessor("internal_notes", {
			header: "Internal Notes",
			cell: (info) => (
				<InternalNotesCell
					notes={info.getValue()}
					universityName={info.row.original.university?.name}
				/>
			),
		}),

		// Added At
		entryColumnHelper.accessor("added_at", {
			header: "Added At",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createEntryRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (entry: any) => {
			setEditModal({
				isOpen: true,
				type: "entry",
				data: entry,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (entry: any) => {
			setDeleteModal({
				isOpen: true,
				type: "entry",
				id: entry.id,
				title: `Delete entry for ${entry.university?.name || "Unknown"}`,
			});
		},
	},
];
