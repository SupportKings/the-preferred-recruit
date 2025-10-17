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

interface InlineStatusCellProps {
	value: string | null;
	onSave: (value: string | null) => Promise<void>;
	options: Array<{ value: string; label: string }>;
	formatValue?: (value: string | null) => string;
}

export function InlineStatusCell({
	value,
	onSave,
	options,
	formatValue,
}: InlineStatusCellProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	const displayValue = formatValue
		? formatValue(value)
		: options.find((opt) => opt.value === value)?.label || "Not set";

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === value) {
			setIsEditing(false);
			return;
		}

		setIsUpdating(true);
		try {
			await onSave(newStatus);
		} catch (error) {
			console.error("Error updating status:", error);
		} finally {
			setIsUpdating(false);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<Select
				value={value || ""}
				onValueChange={handleStatusChange}
				disabled={isUpdating}
				open={isEditing}
				onOpenChange={setIsEditing}
			>
				<SelectTrigger className="h-8 w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
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
			<StatusBadge>{displayValue}</StatusBadge>
		</button>
	);
}
