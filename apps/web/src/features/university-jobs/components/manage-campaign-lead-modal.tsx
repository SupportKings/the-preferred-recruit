"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { CampaignLookup } from "@/components/lookups/campaign-lookup";
import { UniversityLookup } from "@/components/lookups/university-lookup";
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

import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import { universityJobQueries } from "@/features/university-jobs/queries/useUniversityJobs";

import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import {
	createCampaignLead,
	updateCampaignLead,
} from "../actions/relations/campaignLeads";

interface ManageCampaignLeadModalProps {
	universityJobId: string;
	mode: "add" | "edit";
	campaignLead?: unknown;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageCampaignLeadModal({
	universityJobId,
	mode,
	campaignLead,
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

	const initialFormData = {
		campaign_id: null as string | null,
		university_id: null as string | null,
		program_id: null as string | null,
		status: "pending" as string,
		include_reason: "",
		internal_notes: "",
	};

	const [formData, setFormData] = useState(initialFormData);

	// Reset form when modal opens/closes or mode/data changes
	useEffect(() => {
		if (open) {
			if (isEdit && campaignLead) {
				const lead = campaignLead as {
					campaigns?: { id: string } | null;
					universities?: { id: string } | null;
					programs?: { id: string } | null;
					status?: string | null;
					include_reason?: string | null;
					internal_notes?: string | null;
				};
				setFormData({
					campaign_id: lead.campaigns?.id || null,
					university_id: lead.universities?.id || null,
					program_id: lead.programs?.id || null,
					status: lead.status || "pending",
					include_reason: lead.include_reason || "",
					internal_notes: lead.internal_notes || "",
				});
			} else if (!isEdit) {
				setFormData({
					campaign_id: null,
					university_id: null,
					program_id: null,
					status: "pending",
					include_reason: "",
					internal_notes: "",
				});
			}
		} else {
			// Reset form when modal closes
			setFormData({
				campaign_id: null,
				university_id: null,
				program_id: null,
				status: "pending",
				include_reason: "",
				internal_notes: "",
			});
		}
	}, [open, isEdit, campaignLead]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			if (isEdit && campaignLead) {
				const lead = campaignLead as { id: string };
				await updateCampaignLead(lead.id, {
					status: formData.status,
					include_reason: formData.include_reason,
					internal_notes: formData.internal_notes,
					program_id: formData.program_id,
				});
				toast.success("Campaign lead updated successfully!");
			} else {
				await createCampaignLead(universityJobId, formData);
				toast.success("Campaign lead added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: universityJobQueries.detail(universityJobId),
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
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							{isEdit ? (
								<Edit className="h-4 w-4" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							{isEdit ? "Edit Campaign Lead" : "Add Campaign Lead"}
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
							: "Add a new campaign lead for this position."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{!isEdit && (
						<>
							<div className="space-y-2">
								<Label htmlFor="campaign_id">Campaign</Label>
								<CampaignLookup
									value={formData.campaign_id || ""}
									onChange={(value) =>
										setFormData({ ...formData, campaign_id: value || null })
									}
									label=""
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="university_id">University</Label>
								<UniversityLookup
									value={formData.university_id || ""}
									onChange={(value) =>
										setFormData({ ...formData, university_id: value || null })
									}
									label=""
								/>
							</div>
						</>
					)}

					<div className="space-y-2">
						<Label htmlFor="program_id">Program</Label>
						<ProgramLookup
							universityId={formData.university_id || ""}
							value={formData.program_id || ""}
							onChange={(value) =>
								setFormData({ ...formData, program_id: value || null })
							}
							label=""
							disabled={!formData.university_id && !isEdit}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="status">Lead Status</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData({ ...formData, status: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="replied">Replied</SelectItem>
								<SelectItem value="suppressed">Suppressed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Include Reason</Label>
						<Textarea
							placeholder="Why this lead is included..."
							value={formData.include_reason}
							onChange={(e) =>
								setFormData({ ...formData, include_reason: e.target.value })
							}
							rows={2}
						/>
					</div>

					<div className="space-y-2">
						<Label>Internal Notes</Label>
						<Textarea
							placeholder="Private notes about this lead..."
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={2}
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
									? "Update Campaign Lead"
									: "Add Campaign Lead"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
