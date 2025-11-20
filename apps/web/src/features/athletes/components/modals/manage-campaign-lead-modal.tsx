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
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { formatLocalDate as format } from "@/lib/date-utils";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { CampaignLookup } from "../lookups/campaign-lookup";
import { CoachLookup } from "../lookups/coach-lookup";
import { ProgramLookup } from "../lookups/program-lookup";
import { UniversityLookup } from "../lookups/university-lookup";

interface ManageCampaignLeadModalProps {
	athleteId: string;
	mode: "add" | "edit";
	lead?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageCampaignLeadModal({
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
		campaign_id: "",
		university_id: "",
		program_id: "",
		coach_id: "",
		status: "pending",
		first_reply_date: "",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && lead) {
			setFormData({
				campaign_id: lead.campaign_id || "",
				university_id: lead.university_id || "",
				program_id: lead.program_id || "",
				coach_id: lead.coach_id || "",
				status: lead.status || "pending",
				first_reply_date: lead.first_reply_date
					? format(lead.first_reply_date, "yyyy-MM-dd")
					: "",
				internal_notes: lead.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				campaign_id: "",
				university_id: "",
				program_id: "",
				coach_id: "",
				status: "pending",
				first_reply_date: "",
				internal_notes: "",
			});
		}
	}, [isEdit, lead, open]);

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
			if (isEdit && lead) {
				await updateCampaignLead(lead.id, {
					status: formData.status,
					first_reply_date: formData.first_reply_date || undefined,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign lead updated successfully!");
			} else {
				await createCampaignLead({
					campaign_id: formData.campaign_id,
					university_id: formData.university_id,
					program_id: formData.program_id || undefined,
					coach_id: formData.coach_id || undefined,
					status: formData.status,
					first_reply_date: formData.first_reply_date || undefined,
					internal_notes: formData.internal_notes,
				});
				toast.success("Campaign lead added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
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
							<Plus className="h-4 w-4" />
							Add Lead
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
							: "Add a new university lead to this campaign."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<CampaignLookup
						athleteId={athleteId}
						value={formData.campaign_id}
						onChange={(value) =>
							setFormData({ ...formData, campaign_id: value })
						}
						label="Campaign"
						required
						disabled={isEdit}
					/>

					<UniversityLookup
						value={formData.university_id}
						onChange={(value) =>
							setFormData({
								...formData,
								university_id: value,
								program_id: "",
							})
						}
						label="University"
						required
						disabled={isEdit}
					/>

					<ProgramLookup
						universityId={formData.university_id}
						value={formData.program_id}
						onChange={(value) =>
							setFormData({ ...formData, program_id: value })
						}
						label="Program (Optional)"
						required={false}
						disabled={isEdit || !formData.university_id}
					/>

					<CoachLookup
						value={formData.coach_id}
						onChange={(value) => setFormData({ ...formData, coach_id: value })}
						label="Coach (Optional)"
						required={false}
						disabled={isEdit}
					/>

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
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="sent">Sent</SelectItem>
								<SelectItem value="replied">Replied</SelectItem>
								<SelectItem value="interested">Interested</SelectItem>
								<SelectItem value="not_interested">Not Interested</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="first_reply_date">First Reply Date</Label>
						<DatePicker
							id="first_reply_date"
							value={formData.first_reply_date}
							onChange={(value) =>
								setFormData({ ...formData, first_reply_date: value })
							}
							placeholder="When they first replied"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Notes about this lead"
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
