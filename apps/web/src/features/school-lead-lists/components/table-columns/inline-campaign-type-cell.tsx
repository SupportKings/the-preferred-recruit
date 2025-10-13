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

interface InlineCampaignTypeCellProps {
	campaignId: string;
	currentType: string;
}

const CAMPAIGN_TYPE_OPTIONS = [
	{ value: "top", label: "Top Tier" },
	{ value: "second_pass", label: "Second Pass" },
	{ value: "third_pass", label: "Third Pass" },
	{ value: "personal_best", label: "Personal Best" },
];

const getTypeLabel = (type: string) => {
	const option = CAMPAIGN_TYPE_OPTIONS.find((opt) => opt.value === type);
	return option?.label || type;
};

export function InlineCampaignTypeCell({
	campaignId,
	currentType,
}: InlineCampaignTypeCellProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [type, setType] = useState(currentType);
	const router = useRouter();

	const { execute, isExecuting } = useAction(updateCampaignAction, {
		onSuccess: ({ data }) => {
			if (data?.success) {
				toast.success("Type updated successfully");
				router.refresh();
			} else {
				toast.error(data?.error || "Failed to update type");
				setType(currentType); // Revert on error
			}
		},
		onError: () => {
			toast.error("Failed to update type");
			setType(currentType); // Revert on error
		},
	});

	const handleTypeChange = async (newType: string) => {
		if (newType === type) {
			setIsEditing(false);
			return;
		}

		setType(newType);
		setIsEditing(false);

		execute({
			id: campaignId,
			type: newType,
		});
	};

	if (isEditing) {
		return (
			<Select
				value={type}
				onValueChange={handleTypeChange}
				disabled={isExecuting}
				open={isEditing}
				onOpenChange={setIsEditing}
			>
				<SelectTrigger className="h-8 w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{CAMPAIGN_TYPE_OPTIONS.map((option) => (
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
			<StatusBadge>{getTypeLabel(type)}</StatusBadge>
		</button>
	);
}
