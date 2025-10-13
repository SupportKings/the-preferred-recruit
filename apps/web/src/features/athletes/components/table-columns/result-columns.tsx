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

export const createResultColumns = () => {
	const resultColumnHelper = createColumnHelper<any>();
	return [
		// Event Name
		resultColumnHelper.accessor("event.name", {
			header: "Event",
			cell: (info) => {
				const code = info.row.original.event?.code;
				const name = info.getValue();
				return code ? `${code} - ${name}` : name || "Unknown Event";
			},
		}),

		// Performance Mark
		resultColumnHelper.accessor("performance_mark", {
			header: "Mark",
			cell: (info) => {
				const mark = info.getValue();
				const units = info.row.original.event?.units;
				return mark ? `${mark} ${units || ""}`.trim() : "N/A";
			},
		}),

		// Date Recorded
		resultColumnHelper.accessor("date_recorded", {
			header: "Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Location
		resultColumnHelper.accessor("location", {
			header: "Location",
			cell: (info) => info.getValue() || "Unknown",
		}),

		// Hand Timed
		resultColumnHelper.accessor("hand_timed", {
			header: "Hand Timed",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Hand" : "FAT"}</StatusBadge>
			),
		}),

		// Wind
		resultColumnHelper.accessor("wind", {
			header: "Wind",
			cell: (info) => {
				const wind = info.getValue();
				return wind ? `${wind}` : "N/A";
			},
		}),

		// Altitude
		resultColumnHelper.accessor("altitude", {
			header: "Altitude",
			cell: (info) => (
				<StatusBadge>{info.getValue() ? "Altitude" : "Sea Level"}</StatusBadge>
			),
		}),
	];
};

export const createResultRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (result: any) => {
			setEditModal({
				isOpen: true,
				type: "result",
				data: result,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (result: any) => {
			setDeleteModal({
				isOpen: true,
				type: "result",
				id: result.id,
				title: `Delete result for ${result.event?.name || "Unknown Event"}`,
			});
		},
	},
];
