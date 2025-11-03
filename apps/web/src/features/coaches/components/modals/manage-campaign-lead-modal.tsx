"use client";

import { type ReactNode, useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
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
	createCampaignLead,
	updateCampaignLead,
} from "@/features/athletes/actions/campaignLeads";
import { CampaignLookup } from "@/features/athletes/components/lookups/campaign-lookup";
import { LeadListLookup } from "@/features/athletes/components/lookups/lead-list-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import { UniversityJobLookup } from "@/features/athletes/components/lookups/university-job-lookup";
import { UniversityLookup } from "@/features/athletes/components/lookups/university-lookup";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { coachQueries } from "../../queries/useCoaches";

interface ManageCampaignLeadModalProps {
	coachId: string;
	mode?: "create" | "edit";
	campaignLead?: {
		id: string;
		status?: string | null;
		include_reason?: string | null;
		internal_notes?: string | null;
		university_job_id?: string | null;
		campaign_id?: string | null;
		university_id?: string | null;
		program_id?: string | null;
	};
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageCampaignLeadModal({
	coachId,
	mode = "create",
	campaignLead,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageCampaignLeadModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const [selectedCampaignAthleteId, setSelectedCampaignAthleteId] = useState<
		string | null
	>(null);

	const [formData, setFormData] = useState({
		campaign_id: campaignLead?.campaign_id || "",
		university_id: campaignLead?.university_id || "",
		program_id: campaignLead?.program_id || "",
		university_job_id: campaignLead?.university_job_id || "",
		source_lead_list_id: "",
		include_reason: campaignLead?.include_reason || "",
		status: campaignLead?.status || "pending",
		internal_notes: campaignLead?.internal_notes || "",
	});

	// Fetch campaign's athlete_id when campaign is selected
	useEffect(() => {
		const fetchCampaignAthleteId = async () => {
			if (!formData.campaign_id) {
				setSelectedCampaignAthleteId(null);
				return;
			}

			const supabase = createClient();
			const { data, error } = await supabase
				.from("campaigns")
				.select("athlete_id")
				.eq("id", formData.campaign_id)
				.single();

			if (!error && (data as any)?.athlete_id) {
				setSelectedCampaignAthleteId((data as any).athlete_id);
			}
		};

		fetchCampaignAthleteId();
	}, [formData.campaign_id]);

	// Update form data when campaignLead changes (for edit mode)
	useEffect(() => {
		if (mode === "edit" && campaignLead) {
			setFormData({
				campaign_id: campaignLead.campaign_id || "",
				university_id: campaignLead.university_id || "",
				program_id: campaignLead.program_id || "",
				university_job_id: campaignLead.university_job_id || "",
				source_lead_list_id: "",
				include_reason: campaignLead.include_reason || "",
				status: campaignLead.status || "pending",
				internal_notes: campaignLead.internal_notes || "",
			});
		}
	}, [mode, campaignLead]);

	const resetForm = () => {
		if (mode === "create") {
			setFormData({
				campaign_id: "",
				university_id: "",
				program_id: "",
				university_job_id: "",
				source_lead_list_id: "",
				include_reason: "",
				status: "pending",
				internal_notes: "",
			});
			setSelectedCampaignAthleteId(null);
		} else if (mode === "edit" && campaignLead) {
			// Reset to original values in edit mode
			setFormData({
				campaign_id: campaignLead.campaign_id || "",
				university_id: campaignLead.university_id || "",
				program_id: campaignLead.program_id || "",
				university_job_id: campaignLead.university_job_id || "",
				source_lead_list_id: "",
				include_reason: campaignLead.include_reason || "",
				status: campaignLead.status || "pending",
				internal_notes: campaignLead.internal_notes || "",
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (mode === "create") {
			if (!formData.campaign_id) {
				toast.error("Campaign is required");
				return;
			}

			if (!formData.university_id) {
				toast.error("University is required");
				return;
			}
		}

		setIsLoading(true);

		try {
			let result;

			if (mode === "edit" && campaignLead) {
				// Edit mode - only update editable fields
				result = await updateCampaignLead(campaignLead.id, {
					status: formData.status,
					include_reason: formData.include_reason || undefined,
					internal_notes: formData.internal_notes || undefined,
					university_job_id: formData.university_job_id || undefined,
				});

				if (result?.success) {
					toast.success("Campaign lead updated successfully!");
				} else {
					toast.error("Failed to update campaign lead");
				}
			} else {
				// Create mode
				result = await createCampaignLead({
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
					// Reset form for create mode
					resetForm();
				} else {
					toast.error("Failed to create campaign lead");
				}
			}

			if (result?.success) {
				// Invalidate coach queries
				await queryClient.invalidateQueries({
					queryKey: coachQueries.detail(coachId),
				});

				setOpen(false);
			}
		} catch (error) {
			console.error(
				`Error ${mode === "edit" ? "updating" : "creating"} campaign lead:`,
				error,
			);
			toast.error(
				error instanceof Error
					? error.message
					: `Failed to ${mode === "edit" ? "update" : "create"} campaign lead`,
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		resetForm();
		setOpen(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			resetForm();
		}
		setOpen(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger>{children}</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{mode === "edit" ? "Edit Campaign Lead" : "Add Campaign Lead"}
					</DialogTitle>
					<DialogDescription>
						{mode === "edit"
							? "Update the campaign lead details."
							: "Create a new campaign lead for this coach."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{mode === "create" && (
						<>
							{/* Campaign (Required) */}
							<CampaignLookup
								value={formData.campaign_id}
								onChange={(value) =>
									setFormData((prev) => ({
										...prev,
										campaign_id: value,
										// Clear lead list when campaign changes
										source_lead_list_id: "",
									}))
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
							{/* Source Lead List */}
							<LeadListLookup
								value={formData.source_lead_list_id}
								onChange={(value) =>
									setFormData((prev) => ({
										...prev,
										source_lead_list_id: value,
									}))
								}
								athleteId={selectedCampaignAthleteId || undefined}
								label="Source Lead List"
								disabled={!formData.campaign_id}
							/>
						</>
					)}

					{/* University Job - editable in both modes */}
					<UniversityJobLookup
						key={
							mode === "edit"
								? `edit-${campaignLead?.id}-${campaignLead?.university_id}`
								: `create-${formData.university_id}`
						}
						value={formData.university_job_id}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, university_job_id: value }))
						}
						label="University Job"
						universityId={
							mode === "edit"
								? campaignLead?.university_id || undefined
								: formData.university_id
						}
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
							onClick={handleCancel}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? mode === "edit"
									? "Updating..."
									: "Creating..."
								: mode === "edit"
									? "Update Lead"
									: "Create Lead"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
