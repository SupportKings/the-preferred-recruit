"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
	createCampaignLead,
	updateCampaignLead,
} from "@/features/athletes/actions/campaignLeads";
import { LeadListLookup } from "@/features/athletes/components/lookups/lead-list-lookup";
import { UniversityJobLookup } from "@/features/athletes/components/lookups/university-job-lookup";
import { campaignQueries } from "@/features/campaigns/queries/useCampaigns";

import { useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface ManageCampaignLeadModalProps {
	campaignId: string;
	athleteId?: string;
	mode: "add" | "edit";
	lead?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageCampaignLeadModal({
	campaignId,
	athleteId,
	mode,
	lead,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageCampaignLeadModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		source_lead_list_id: "",
		university_job_id: "",
		include_reason: "",
		status: "pending",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && lead) {
			setFormData({
				source_lead_list_id: lead.source_lead_list_id || "",
				university_job_id: lead.university_job_id || "",
				include_reason: lead.include_reason || "",
				status: lead.status || "pending",
				internal_notes: lead.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				source_lead_list_id: "",
				university_job_id: "",
				include_reason: "",
				status: "pending",
				internal_notes: "",
			});
		}
	}, [isEdit, lead]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			if (isEdit && lead) {
				await updateCampaignLead(lead.id, {
					university_job_id: formData.university_job_id || undefined,
					source_lead_list_id: formData.source_lead_list_id || undefined,
					include_reason: formData.include_reason,
					status: formData.status,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign lead updated successfully!");
			} else {
				await createCampaignLead({
					campaign_id: campaignId,
					source_lead_list_id: formData.source_lead_list_id || undefined,
					university_job_id: formData.university_job_id || undefined,
					include_reason: formData.include_reason,
					status: formData.status,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign lead added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: campaignQueries.detail(campaignId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} campaign lead:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} campaign lead`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger asChild>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							{isEdit ? "Edit Lead" : "Add Lead"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						{isEdit ? "Edit Campaign Lead" : "Add New Campaign Lead"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the campaign lead details."
							: "Add a new lead to this campaign."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{!isEdit && athleteId && (
						<LeadListLookup
							athleteId={athleteId}
							value={formData.source_lead_list_id}
							onChange={(value) =>
								setFormData({ ...formData, source_lead_list_id: value })
							}
							label="Source Lead List (Optional)"
							required={false}
						/>
					)}

					<UniversityJobLookup
						value={formData.university_job_id}
						onChange={(value) =>
							setFormData({ ...formData, university_job_id: value })
						}
						label="Coach/Job (Optional)"
						required={false}
					/>

					<div>
						<Label htmlFor="include_reason">Include Reason</Label>
						<Textarea
							id="include_reason"
							placeholder="Why this lead is included"
							value={formData.include_reason}
							onChange={(e) =>
								setFormData({ ...formData, include_reason: e.target.value })
							}
							rows={2}
						/>
					</div>

					<div>
						<Label htmlFor="status">Lead Status</Label>
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
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="replied">Replied</SelectItem>
								<SelectItem value="suppressed">Suppressed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this lead"
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
									? "Update Lead"
									: "Add Lead"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
