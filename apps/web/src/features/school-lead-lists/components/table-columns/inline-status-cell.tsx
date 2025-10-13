"use client";

import { useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateSchoolLeadListEntry } from "../../actions/relations/entries";
import { ENTRY_STATUS_OPTIONS } from "../../constants/entry-status-options";
import { schoolLeadListQueries } from "../../queries/useSchoolLeadLists";
import { getEntryStatusColor } from "../../utils/get-entry-status-color";

interface InlineStatusCellProps {
	entryId: string;
	currentStatus: string;
	leadListId: string;
}

export function InlineStatusCell({
	entryId,
	currentStatus,
	leadListId,
}: InlineStatusCellProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState(currentStatus);
	const [isUpdating, setIsUpdating] = useState(false);
	const queryClient = useQueryClient();

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === status) {
			setIsEditing(false);
			return;
		}

		setIsUpdating(true);
		try {
			await updateSchoolLeadListEntry(entryId, { status: newStatus });
			setStatus(newStatus);
			toast.success("Status updated successfully");

			// Invalidate the lead list query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: schoolLeadListQueries.detail(leadListId),
			});
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error("Failed to update status");
		} finally {
			setIsUpdating(false);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<Select
				value={status}
				onValueChange={handleStatusChange}
				disabled={isUpdating}
				open={isEditing}
				onOpenChange={setIsEditing}
			>
				<SelectTrigger className="h-8 w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{ENTRY_STATUS_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
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
			<StatusBadge colorScheme={getEntryStatusColor(status)}>
				{status}
			</StatusBadge>
		</button>
	);
}
