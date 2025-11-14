"use client";

import { type ReactNode, useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createCampaignAction } from "@/features/campaigns/actions/createCampaign";

import { useQueryClient } from "@tanstack/react-query";
import { formatLocalDate as format, getTodayDateString } from "@/lib/date-utils";
import { GitBranch } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ManageDerivedCampaignModalProps {
	campaignId: string;
	athleteId: string;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageDerivedCampaignModal({
	campaignId,
	athleteId,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageDerivedCampaignModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const queryClient = useQueryClient();

	const nameId = useId();
	const typeId = useId();
	const dailySendCapId = useId();
	const startDateId = useId();
	const internalNotesId = useId();

	const [formData, setFormData] = useState({
		name: "",
		type: "second_pass" as const,
		primary_lead_list_id: "",
		daily_send_cap: "",
		start_date: getTodayDateString(),
		internal_notes: "",
	});

	const { execute: executeCreateCampaign, isExecuting } = useAction(
		createCampaignAction,
		{
			onSuccess: () => {
				toast.success("Derived campaign created successfully!");
				queryClient.invalidateQueries({
					queryKey: ["campaigns", "detail", campaignId],
				});
				queryClient.invalidateQueries({
					queryKey: ["athletes", "detail", athleteId],
				});
				setOpen(false);
			},
			onError: (error) => {
				console.error("Error creating derived campaign:", error);
				toast.error("Failed to create derived campaign");
			},
		},
	);

	useEffect(() => {
		if (!open) {
			setFormData({
				name: "",
				type: "second_pass",
				primary_lead_list_id: "",
				daily_send_cap: "",
				start_date: getTodayDateString(),
				internal_notes: "",
			});
		}
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Campaign name is required");
			return;
		}

		executeCreateCampaign({
			athlete_id: athleteId,
			name: formData.name,
			type: formData.type,
			seed_campaign_id: campaignId,
			primary_lead_list_id: formData.primary_lead_list_id || undefined,
			daily_send_cap: formData.daily_send_cap
				? Number.parseInt(formData.daily_send_cap, 10)
				: undefined,
			start_date: formData.start_date,
			internal_notes: formData.internal_notes,
			status: "draft",
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined &&
				(children ? (
					<DialogTrigger>{children}</DialogTrigger>
				) : (
					<DialogTrigger>
						<Button variant="outline" size="sm" className="gap-2">
							<GitBranch className="h-4 w-4" />
							Create Derived Campaign
						</Button>
					</DialogTrigger>
				))}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GitBranch className="h-5 w-5" />
						Create Derived Campaign
					</DialogTitle>
					<DialogDescription>
						Create a new campaign derived from this campaign. The new campaign
						will inherit the seed campaign relationship.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={nameId}>Campaign Name *</Label>
						<Input
							id={nameId}
							placeholder="e.g., Spring 2024 Second Pass"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={typeId}>Type</Label>
						<Select
							value={formData.type}
							onValueChange={(value: typeof formData.type) =>
								setFormData({ ...formData, type: value })
							}
						>
							<SelectTrigger id={typeId}>
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="top">Top Tier</SelectItem>
								<SelectItem value="second_pass">Second Pass</SelectItem>
								<SelectItem value="third_pass">Third Pass</SelectItem>
								<SelectItem value="personal_best">Personal Best</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor={dailySendCapId}>Daily Send Cap</Label>
						<Input
							id={dailySendCapId}
							type="number"
							placeholder="e.g., 50"
							value={formData.daily_send_cap}
							onChange={(e) =>
								setFormData({ ...formData, daily_send_cap: e.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={startDateId}>Start Date</Label>
						<DatePicker
							id={startDateId}
							value={formData.start_date}
							onChange={(value) =>
								setFormData({ ...formData, start_date: value })
							}
							placeholder="Select start date"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={internalNotesId}>Internal Notes</Label>
						<Textarea
							id={internalNotesId}
							placeholder="Strategy or notes"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isExecuting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isExecuting}>
							{isExecuting ? "Creating..." : "Create Derived Campaign"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
