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

import {
	createCampaign,
	updateCampaign,
} from "@/features/athletes/actions/campaigns";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { formatLocalDate as format, getTodayDateString } from "@/lib/date-utils";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { LeadListLookup } from "../lookups/lead-list-lookup";

interface ManageCampaignModalProps {
	athleteId: string;
	mode: "add" | "edit";
	campaign?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageCampaignModal({
	athleteId,
	mode,
	campaign,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageCampaignModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		name: "",
		type: "top",
		status: "draft",
		primary_lead_list_id: "",
		daily_send_cap: "",
		start_date: getTodayDateString(),
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && campaign) {
			setFormData({
				name: campaign.name || "",
				type: campaign.type || "top",
				status: campaign.status || "draft",
				primary_lead_list_id: campaign.primary_lead_list_id || "",
				daily_send_cap: campaign.daily_send_cap?.toString() || "",
				start_date: campaign.start_date
					? format(campaign.start_date, "yyyy-MM-dd")
					: getTodayDateString(),
				internal_notes: campaign.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				name: "",
				type: "top",
				status: "draft",
				primary_lead_list_id: "",
				daily_send_cap: "",
				start_date: getTodayDateString(),
				internal_notes: "",
			});
		}
	}, [isEdit, campaign, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Campaign name is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && campaign) {
				await updateCampaign(campaign.id, {
					name: formData.name,
					type: formData.type,
					status: formData.status,
					daily_send_cap: formData.daily_send_cap
						? Number.parseInt(formData.daily_send_cap, 10)
						: undefined,
					start_date: formData.start_date,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign updated successfully!");
			} else {
				await createCampaign(athleteId, {
					name: formData.name,
					type: formData.type,
					primary_lead_list_id: formData.primary_lead_list_id || undefined,
					daily_send_cap: formData.daily_send_cap
						? Number.parseInt(formData.daily_send_cap, 10)
						: undefined,
					start_date: formData.start_date,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			setOpen(false);
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} campaign:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} campaign`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							Add Campaign
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						{isEdit ? "Edit Campaign" : "Add New Campaign"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the campaign details."
							: "Create a new outreach campaign for this athlete."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Campaign Name *</Label>
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

					<div className="space-y-2">
						<Label htmlFor="type">Type</Label>
						<Select
							value={formData.type}
							onValueChange={(value) =>
								setFormData({ ...formData, type: value })
							}
						>
							<SelectTrigger id="type">
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

					{isEdit && (
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value) =>
									setFormData({ ...formData, status: value })
								}
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
					)}

					<LeadListLookup
						athleteId={athleteId}
						value={formData.primary_lead_list_id}
						onChange={(value) =>
							setFormData({ ...formData, primary_lead_list_id: value })
						}
						label="Primary Lead List (Optional)"
						required={false}
					/>

					<div className="space-y-2">
						<Label htmlFor="daily_send_cap">Daily Send Cap</Label>
						<Input
							id="daily_send_cap"
							type="number"
							placeholder="e.g., 50"
							value={formData.daily_send_cap}
							onChange={(e) =>
								setFormData({ ...formData, daily_send_cap: e.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
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

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
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
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? isEdit
									? "Updating..."
									: "Adding..."
								: isEdit
									? "Update Campaign"
									: "Add Campaign"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
