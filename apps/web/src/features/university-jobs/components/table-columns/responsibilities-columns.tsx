import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

export const createResponsibilitiesColumns = () => {
	const responsibilitiesColumnHelper = createColumnHelper<{
		id: string;
		event_group: string | null;
		events: {
			id: string;
			code: string | null;
			name: string | null;
			event_group: string | null;
		} | null;
		internal_notes: string | null;
	}>();

	return [
		responsibilitiesColumnHelper.accessor("event_group", {
			header: "Event Group",
			cell: (info) => (
				<span className="capitalize">{info.getValue() || "Not specified"}</span>
			),
		}),
		responsibilitiesColumnHelper.accessor("events.code", {
			header: "Specific Event",
			cell: (info) =>
				info.getValue() ||
				info.row.original.events?.name ||
				"No specific event",
		}),
		responsibilitiesColumnHelper.accessor("events.event_group", {
			header: "Event Category",
			cell: (info) => (
				<span className="capitalize">{info.getValue() || "-"}</span>
			),
		}),
		responsibilitiesColumnHelper.accessor("internal_notes", {
			header: "Internal Notes",
			cell: (info) => {
				const notes = info.getValue();
				if (!notes) return "-";
				return (
					<span className="max-w-[200px] truncate" title={notes}>
						{notes}
					</span>
				);
			},
		}),
	];
};

export const createResponsibilitiesRowActions = (
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void,
	setEditModal: (modal: { isOpen: boolean; type: string; data: unknown }) => void,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (responsibility: {
			id: string;
			event_group: string | null;
			events: {
				id: string;
				code: string | null;
				name: string | null;
			} | null;
		}) => {
			setEditModal({
				isOpen: true,
				type: "responsibility",
				data: responsibility,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (responsibility: { id: string; event_group: string | null }) => {
			setDeleteModal({
				isOpen: true,
				type: "responsibility",
				id: responsibility.id,
				title: `Delete responsibility for ${responsibility.event_group || "Unknown"}`,
			});
		},
	},
];
