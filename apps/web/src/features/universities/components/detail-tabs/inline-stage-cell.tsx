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

import { getStageColor } from "@/features/athlete-applications/utils/get-stage-color";

interface InlineStageCellProps {
	value: string | null;
	onSave: (value: string | null) => Promise<void>;
}

const STAGE_OPTIONS = [
	{ value: "intro", label: "Intro" },
	{ value: "ongoing", label: "Ongoing" },
	{ value: "visit", label: "Visit" },
	{ value: "offer", label: "Offer" },
	{ value: "committed", label: "Committed" },
	{ value: "dropped", label: "Dropped" },
];

export function InlineStageCell({ value, onSave }: InlineStageCellProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [stage, setStage] = useState(value || "");
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStageChange = async (newStage: string) => {
		if (newStage === stage) {
			setIsEditing(false);
			return;
		}

		setIsUpdating(true);
		try {
			await onSave(newStage);
			setStage(newStage);
		} catch (error) {
			console.error("Error updating stage:", error);
		} finally {
			setIsUpdating(false);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<Select
				value={stage}
				onValueChange={handleStageChange}
				disabled={isUpdating}
				open={isEditing}
				onOpenChange={setIsEditing}
			>
				<SelectTrigger className="h-8 w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{STAGE_OPTIONS.map((option) => (
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
			<StatusBadge colorScheme={getStageColor(stage)}>
				{stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : "Not set"}
			</StatusBadge>
		</button>
	);
}
