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

export const createLeadListEntryColumns = () => {
	const entryColumnHelper = createColumnHelper<any>();
	return [
		// Lead List Name
		entryColumnHelper.accessor("school_lead_list.name", {
			header: "Lead List",
			cell: (info) => info.getValue() || "Unknown List",
		}),

		// University Name
		entryColumnHelper.accessor("university.name", {
			header: "University",
			cell: (info) => {
				const universityId = info.row.original.university?.id;
				const name = info.getValue() || "Unknown";

				if (!universityId) return name;

				return (
					<Link
						href={`/dashboard/universities/${universityId}`}
						className="text-primary hover:underline"
					>
						{name}
					</Link>
				);
			},
		}),

		// University City
		entryColumnHelper.accessor("university.city", {
			header: "City",
			cell: (info) => info.getValue() || "N/A",
		}),

		// Program Gender
		entryColumnHelper.accessor("program.gender", {
			header: "Program",
			cell: (info) => {
				const gender = info.getValue();
				if (!gender) return "N/A";
				return gender === "men" ? "Men's" : gender === "women" ? "Women's" : gender;
			},
		}),

		// Status
		entryColumnHelper.accessor("status", {
			header: "Status",
			cell: (info) => <StatusBadge>{info.getValue() || "N/A"}</StatusBadge>,
		}),

		// Added At
		entryColumnHelper.accessor("added_at", {
			header: "Added",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createLeadListEntryRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (entry: any) => {
			setEditModal({
				isOpen: true,
				type: "leadListEntry",
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
				type: "leadListEntry",
				id: entry.id,
				title: `Delete entry for ${entry.university?.name || "Unknown"}`,
			});
		},
	},
];
