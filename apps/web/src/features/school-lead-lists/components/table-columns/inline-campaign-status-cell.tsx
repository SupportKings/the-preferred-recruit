"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { updateCampaignAction } from "@/features/campaigns/actions/updateCampaign";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface InlineCampaignStatusCellProps {
	campaignId: string;
	currentStatus: string;
}

const CAMPAIGN_STATUS_OPTIONS = [
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "completed", label: "Completed" },
	{ value: "exhausted", label: "Exhausted" },
];

const getStatusColor = (status: string) => {
	switch (status) {
		case "active":
			return "green";
		case "draft":
			return "gray";
		case "paused":
			return "yellow";
		case "completed":
			return "blue";
		case "exhausted":
			return "red";
		default:
			return "gray";
	}
};

export function InlineCampaignStatusCell({
	campaignId,
	currentStatus,
}: InlineCampaignStatusCellProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [status, setStatus] = useState(currentStatus);
	const router = useRouter();

	const { execute, isExecuting } = useAction(updateCampaignAction, {
		onSuccess: ({ data }) => {
			if (data?.success) {
				toast.success("Status updated successfully");
				router.refresh();
			} else {
				toast.error(data?.error || "Failed to update status");
				setStatus(currentStatus); // Revert on error
			}
		},
		onError: () => {
			toast.error("Failed to update status");
			setStatus(currentStatus); // Revert on error
		},
	});

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === status) {
			setIsEditing(false);
			return;
		}

		setStatus(newStatus);
		setIsEditing(false);

		execute({
			id: campaignId,
			status: newStatus,
		});
	};

	if (isEditing) {
		return (
			<Select
				value={status}
				onValueChange={handleStatusChange}
				disabled={isExecuting}
				open={isEditing}
				onOpenChange={setIsEditing}
			>
				<SelectTrigger className="h-8 w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{CAMPAIGN_STATUS_OPTIONS.map((option) => (
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
			<StatusBadge colorScheme={getStatusColor(status)}>{status}</StatusBadge>
		</button>
	);
}
