"use client";

import { type ReactNode, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
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

import { createCampaignLead } from "@/features/athletes/actions/campaignLeads";
import { CampaignLookup } from "@/features/athletes/components/lookups/campaign-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import { UniversityJobLookup } from "@/features/athletes/components/lookups/university-job-lookup";
import { UniversityLookup } from "@/features/athletes/components/lookups/university-lookup";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { coachQueries } from "../../queries/useCoaches";

interface ManageCampaignLeadModalProps {
	coachId: string;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageCampaignLeadModal({
	coachId,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageCampaignLeadModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const [formData, setFormData] = useState({
		campaign_id: "",
		university_id: "",
		program_id: "",
		university_job_id: "",
		source_lead_list_id: "",
		include_reason: "",
		status: "pending",
		internal_notes: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.campaign_id) {
			toast.error("Campaign is required");
			return;
		}

		if (!formData.university_id) {
			toast.error("University is required");
			return;
		}

		setIsLoading(true);

		try {
			const result = await createCampaignLead({
				coach_id: coachId,
				campaign_id: formData.campaign_id,
				university_id: formData.university_id,
				program_id: formData.program_id || undefined,
				university_job_id: formData.university_job_id || undefined,
				source_lead_list_id: formData.source_lead_list_id || undefined,
				include_reason: formData.include_reason || undefined,
				status: formData.status,
				internal_notes: formData.internal_notes || undefined,
			});

			if (result?.success && result.data) {
				toast.success("Campaign lead created successfully!");

				// Invalidate coach queries
				await queryClient.invalidateQueries({
					queryKey: coachQueries.detail(coachId),
				});

				setOpen(false);

				// Navigate to the campaign detail page
				router.push(`/dashboard/campaigns/${formData.campaign_id}`);
			} else {
				toast.error("Failed to create campaign lead");
			}
		} catch (error) {
			console.error("Error creating campaign lead:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create campaign lead",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add Campaign Lead</DialogTitle>
					<DialogDescription>
						Create a new campaign lead for this coach.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Campaign (Required) */}
					<CampaignLookup
						value={formData.campaign_id}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, campaign_id: value }))
						}
						label="Campaign"
						required
					/>

					{/* University (Required) */}
					<UniversityLookup
						value={formData.university_id}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								university_id: value,
								// Clear dependent fields when university changes
								program_id: "",
								university_job_id: "",
							}))
						}
						label="University"
						required
					/>

					{/* Program */}
					<ProgramLookup
						value={formData.program_id}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, program_id: value }))
						}
						label="Program"
						universityId={formData.university_id}
					/>

					{/* University Job */}
					<UniversityJobLookup
						value={formData.university_job_id}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, university_job_id: value }))
						}
						label="University Job"
						universityId={formData.university_id}
					/>

					{/* Status */}
					<div className="space-y-2">
						<Label htmlFor="status">Lead Status</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, status: value }))
							}
						>
							<SelectTrigger id="status">
								<SelectValue placeholder="Select lead status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="replied">Replied</SelectItem>
								<SelectItem value="suppressed">Suppressed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Include Reason */}
					<div className="space-y-2">
						<Label htmlFor="include_reason">Include Reason</Label>
						<Input
							id="include_reason"
							placeholder="Why was this lead included?"
							value={formData.include_reason}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									include_reason: e.target.value,
								}))
							}
						/>
					</div>

					{/* Internal Notes */}
					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this lead"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									internal_notes: e.target.value,
								}))
							}
							rows={4}
						/>
					</div>

					{/* Actions */}
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
							{isLoading ? "Creating..." : "Create Lead"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
