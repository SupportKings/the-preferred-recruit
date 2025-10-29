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
			cell: (info) => {
				const isHandTimed = info.getValue();
				return (
					<span
						className={`inline-flex h-7 items-center rounded-full px-3 font-medium text-xs ${
							isHandTimed
								? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
								: "bg-gray-50 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400"
						}`}
					>
						{isHandTimed ? "Yes" : "No"}
					</span>
				);
			},
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
			cell: (info) => {
				const isAltitude = info.getValue();
				return (
					<span
						className={`inline-flex h-7 items-center rounded-full px-3 font-medium text-xs ${
							isAltitude
								? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
								: "bg-gray-50 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400"
						}`}
					>
						{isAltitude ? "Yes" : "No"}
					</span>
				);
			},
		}),

		// Organized Event
		resultColumnHelper.accessor("organized_event", {
			header: "Organized Event",
			cell: (info) => {
				const isOrganized = info.getValue();
				return (
					<span
						className={`inline-flex h-7 items-center rounded-full px-3 font-medium text-xs ${
							isOrganized
								? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
								: "bg-gray-50 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400"
						}`}
					>
						{isOrganized ? "Yes" : "No"}
					</span>
				);
			},
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
