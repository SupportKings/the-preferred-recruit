"use client";

import { type ReactNode, useEffect, useState } from "react";

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

import { AthleteLookup } from "@/features/athletes/components/lookups/athlete-lookup";
import { LeadListLookup } from "@/features/athletes/components/lookups/lead-list-lookup";
import { createCampaignAction } from "@/features/campaigns/actions/createCampaign";

import { Plus, Target } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ManageCampaignModalProps {
	leadListId?: string;
	athleteId?: string;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
}

export function ManageCampaignModal({
	leadListId,
	athleteId,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	onSuccess,
}: ManageCampaignModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	const [formData, setFormData] = useState<{
		athlete_id: string;
		primary_lead_list_id: string;
		name: string;
		type: "top" | "second_pass" | "third_pass" | "personal_best";
		status: "draft" | "active" | "paused" | "completed" | "exhausted";
		daily_send_cap: string;
		start_date: string;
		end_date: string;
		internal_notes: string;
	}>({
		athlete_id: athleteId || "",
		primary_lead_list_id: leadListId || "",
		name: "",
		type: "top",
		status: "draft",
		daily_send_cap: "",
		start_date: "",
		end_date: "",
		internal_notes: "",
	});

	// Reset form when modal opens
	useEffect(() => {
		if (open) {
			setFormData({
				athlete_id: athleteId || "",
				primary_lead_list_id: leadListId || "",
				name: "",
				type: "top",
				status: "draft",
				daily_send_cap: "",
				start_date: "",
				end_date: "",
				internal_notes: "",
			});
		}
	}, [open, leadListId, athleteId]);

	const { execute, isExecuting } = useAction(createCampaignAction, {
		onSuccess: ({ data }) => {
			if (data?.success) {
				toast.success("Campaign created successfully!");
				setOpen(false);
				onSuccess?.();
			} else {
				toast.error(data?.error || "Failed to create campaign");
			}
		},
		onError: () => {
			toast.error("Failed to create campaign. Please try again.");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.athlete_id) {
			toast.error("Please select an athlete");
			return;
		}

		if (!formData.name.trim()) {
			toast.error("Campaign name is required");
			return;
		}

		execute({
			athlete_id: formData.athlete_id,
			primary_lead_list_id: formData.primary_lead_list_id || null,
			name: formData.name.trim(),
			type: formData.type,
			status: formData.status,
			daily_send_cap: formData.daily_send_cap
				? Number.parseInt(formData.daily_send_cap, 10)
				: null,
			start_date: formData.start_date || null,
			end_date: formData.end_date || null,
			internal_notes: formData.internal_notes.trim() || null,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							Create Campaign
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Create New Campaign
					</DialogTitle>
					<DialogDescription>
						Create a new outreach campaign. Select an athlete and configure the
						campaign settings.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Athlete Selection */}
					<AthleteLookup
						value={formData.athlete_id}
						onChange={(value) =>
							setFormData({ ...formData, athlete_id: value })
						}
						label={athleteId ? "Athlete (Prefilled)" : "Athlete"}
						required
						disabled={!!athleteId}
					/>

					{/* Primary Lead List */}
					<LeadListLookup
						athleteId={formData.athlete_id}
						value={formData.primary_lead_list_id}
						onChange={(value) =>
							setFormData({ ...formData, primary_lead_list_id: value })
						}
						label={
							leadListId ? "Primary Lead List (Prefilled)" : "Primary Lead List"
						}
						required={false}
						disabled={!!leadListId}
					/>

					{/* Campaign Name */}
					<div>
						<Label htmlFor="name">
							Campaign Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							placeholder="e.g., Fall 2024 D2 Outreach"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>
					</div>

					{/* Type */}
					<div>
						<Label htmlFor="type">Type</Label>
						<Select
							value={formData.type}
							onValueChange={(
								value: "top" | "second_pass" | "third_pass" | "personal_best",
							) => setFormData({ ...formData, type: value })}
						>
							<SelectTrigger id="type">
								<SelectValue placeholder="Select campaign strategy" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="top">Top Tier</SelectItem>
								<SelectItem value="second_pass">Second Pass</SelectItem>
								<SelectItem value="third_pass">Third Pass</SelectItem>
								<SelectItem value="personal_best">Personal Best</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Status */}
					<div>
						<Label htmlFor="status">Status</Label>
						<Select
							value={formData.status}
							onValueChange={(
								value:
									| "draft"
									| "active"
									| "paused"
									| "completed"
									| "exhausted",
							) => setFormData({ ...formData, status: value })}
						>
							<SelectTrigger id="status">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="paused">Paused</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="exhausted">Exhausted</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Daily Send Cap */}
					<div>
						<Label htmlFor="daily_send_cap">Daily Send Cap</Label>
						<Input
							id="daily_send_cap"
							type="number"
							placeholder="e.g., 50"
							value={formData.daily_send_cap}
							onChange={(e) =>
								setFormData({ ...formData, daily_send_cap: e.target.value })
							}
							min="1"
						/>
					</div>

					{/* Start Date */}
					<div>
						<Label htmlFor="start_date">Start Date</Label>
						<DatePicker
							id="start_date"
							value={formData.start_date}
							onChange={(value) =>
								setFormData({ ...formData, start_date: value })
							}
							placeholder="Select start date"
						/>
					</div>

					{/* End Date */}
					<div>
						<Label htmlFor="end_date">End Date (Optional)</Label>
						<DatePicker
							id="end_date"
							value={formData.end_date}
							onChange={(value) =>
								setFormData({ ...formData, end_date: value })
							}
							placeholder="Select end date"
						/>
					</div>

					{/* Internal Notes */}
					<div>
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Strategy or notes about this campaign"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					{/* Actions */}
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
							{isExecuting ? "Creating..." : "Create Campaign"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
