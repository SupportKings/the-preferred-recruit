"use client";

import { memo, useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { updateChecklistItem } from "@/features/athletes/actions/checklistItems";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

// Inline editable status component
const InlineEditableStatus = memo(function InlineEditableStatus({
	itemId,
	initialValue,
}: {
	itemId: string;
	initialValue: boolean;
}) {
	const [value, setValue] = useState(initialValue);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const handleChange = async (newValue: string) => {
		const boolValue = newValue === "true";
		if (boolValue === value) return;

		setIsLoading(true);
		setIsOpen(false);
		try {
			await updateChecklistItem(itemId, { is_done: boolValue });
			setValue(boolValue);
			toast.success("Status updated");
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error("Failed to update status");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Select
			value={value.toString()}
			onValueChange={handleChange}
			disabled={isLoading}
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<SelectTrigger className="h-8 w-[140px] border-none bg-transparent hover:bg-accent">
				<SelectValue>
					<StatusBadge>{value ? "Complete" : "Pending"}</StatusBadge>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="false">Pending</SelectItem>
				<SelectItem value="true">Complete</SelectItem>
			</SelectContent>
		</Select>
	);
});

// Inline editable required component
const InlineEditableRequired = memo(function InlineEditableRequired({
	itemId,
	initialValue,
}: {
	itemId: string;
	initialValue: boolean;
}) {
	const [value, setValue] = useState(initialValue);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const handleChange = async (newValue: string) => {
		const boolValue = newValue === "true";
		if (boolValue === value) return;

		setIsLoading(true);
		setIsOpen(false);
		try {
			await updateChecklistItem(itemId, { required: boolValue });
			setValue(boolValue);
			toast.success("Updated");
		} catch (error) {
			console.error("Error updating required:", error);
			toast.error("Failed to update");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Select
			value={value.toString()}
			onValueChange={handleChange}
			disabled={isLoading}
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<SelectTrigger className="h-8 w-[140px] border-none bg-transparent hover:bg-accent">
				<SelectValue>
					<StatusBadge>{value ? "Required" : "Optional"}</StatusBadge>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="false">Optional</SelectItem>
				<SelectItem value="true">Required</SelectItem>
			</SelectContent>
		</Select>
	);
});

// Inline editable applicable component
const InlineEditableApplicable = memo(function InlineEditableApplicable({
	itemId,
	initialValue,
}: {
	itemId: string;
	initialValue: boolean;
}) {
	const [value, setValue] = useState(initialValue);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const handleChange = async (newValue: string) => {
		const boolValue = newValue === "true";
		if (boolValue === value) return;

		setIsLoading(true);
		setIsOpen(false);
		try {
			await updateChecklistItem(itemId, { is_applicable: boolValue });
			setValue(boolValue);
			toast.success("Updated");
		} catch (error) {
			console.error("Error updating applicable:", error);
			toast.error("Failed to update");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Select
			value={value.toString()}
			onValueChange={handleChange}
			disabled={isLoading}
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<SelectTrigger className="h-8 w-[140px] border-none bg-transparent hover:bg-accent">
				<SelectValue>
					<StatusBadge>{value ? "Applicable" : "N/A"}</StatusBadge>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="false">N/A</SelectItem>
				<SelectItem value="true">Applicable</SelectItem>
			</SelectContent>
		</Select>
	);
});

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

		// Required - Inline editable
		checklistColumnHelper.accessor("required", {
			header: "Required",
			cell: (info) => {
				const itemId = info.row.original.id;
				const required = info.getValue() || false;
				return (
					<InlineEditableRequired itemId={itemId} initialValue={required} />
				);
			},
		}),

		// Applicable - Inline editable
		checklistColumnHelper.accessor("is_applicable", {
			header: "Applicable",
			cell: (info) => {
				const itemId = info.row.original.id;
				const applicable = info.getValue() ?? true;
				return (
					<InlineEditableApplicable itemId={itemId} initialValue={applicable} />
				);
			},
		}),

		// Done - Inline editable
		checklistColumnHelper.accessor("is_done", {
			header: "Status",
			cell: (info) => {
				const itemId = info.row.original.id;
				const done = info.getValue() || false;
				return <InlineEditableStatus itemId={itemId} initialValue={done} />;
			},
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
