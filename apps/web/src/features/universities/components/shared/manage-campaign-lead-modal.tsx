"use client";

import { type ReactNode, useEffect, useId, useState } from "react";

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
import { CampaignLookup } from "@/features/athletes/components/lookups/campaign-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import { UniversityJobLookup } from "@/features/athletes/components/lookups/university-job-lookup";
import { universityQueries } from "@/features/universities/queries/useUniversities";

import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Send } from "lucide-react";
import { toast } from "sonner";

interface ManageCampaignLeadModalProps {
	universityId: string;
	mode: "add" | "edit";
	lead?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageCampaignLeadModal({
	universityId,
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
	const statusId = useId();
	const notesId = useId();

	const [formData, setFormData] = useState({
		campaign_id: "",
		program_id: "",
		university_job_id: "",
		status: "pending",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && lead) {
			setFormData({
				campaign_id: lead.campaign_id || "",
				program_id: lead.program_id || "",
				university_job_id: lead.university_job_id || "",
				status: lead.status || "pending",
				internal_notes: lead.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				campaign_id: "",
				program_id: "",
				university_job_id: "",
				status: "pending",
				internal_notes: "",
			});
		}
	}, [isEdit, lead]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.campaign_id) {
			toast.error("Campaign is required");
			return;
		}

		if (!formData.program_id) {
			toast.error("Program is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && lead) {
				await updateCampaignLead(lead.id, {
					status: formData.status,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign lead updated successfully!");
			} else {
				await createCampaignLead({
					campaign_id: formData.campaign_id,
					university_id: universityId,
					program_id: formData.program_id,
					university_job_id: formData.university_job_id || undefined,
					status: formData.status,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign lead added successfully!");
			}

			// Invalidate the university query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: universityQueries.detail(universityId),
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
			{externalOpen === undefined &&
				(children ? (
					<DialogTrigger>{children}</DialogTrigger>
				) : (
					<DialogTrigger>
						<Button variant="outline" size="sm" className="gap-2">
							{isEdit ? (
								<Edit className="h-4 w-4" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							{isEdit ? "Edit Lead" : "Add Campaign Lead"}
						</Button>
					</DialogTrigger>
				))}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Send className="h-5 w-5" />
						{isEdit ? "Edit Campaign Lead" : "Add New Campaign Lead"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the campaign lead details."
							: "Add a new campaign lead for this university."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<CampaignLookup
						value={formData.campaign_id}
						onChange={(value) =>
							setFormData({ ...formData, campaign_id: value })
						}
						label="Campaign"
						required
						disabled={isEdit}
					/>

					<ProgramLookup
						universityId={universityId}
						value={formData.program_id}
						onChange={(value) =>
							setFormData({ ...formData, program_id: value })
						}
						label="Program"
						required
						disabled={isEdit}
					/>

					<UniversityJobLookup
						value={formData.university_job_id}
						onChange={(value) =>
							setFormData({ ...formData, university_job_id: value })
						}
						label="Coach/Job (Optional)"
						required={false}
						disabled={isEdit}
					/>

					<div className="space-y-2">
						<Label htmlFor={statusId}>Lead Status</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData({ ...formData, status: value })
							}
						>
							<SelectTrigger id={statusId}>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="replied">Replied</SelectItem>
								<SelectItem value="suppressed">Suppressed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor={notesId}>Internal Notes</Label>
						<Textarea
							id={notesId}
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
