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
	createAthleteApplication,
	updateAthleteApplication,
} from "@/features/athletes/actions/athleteApplications";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { CampaignLookup } from "../lookups/campaign-lookup";
import { LeadListLookup } from "../lookups/lead-list-lookup";
import { ProgramLookup } from "../lookups/program-lookup";
import { UniversityLookup } from "../lookups/university-lookup";

interface ManageApplicationModalProps {
	athleteId: string;
	mode: "add" | "edit";
	application?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageApplicationModal({
	athleteId,
	mode,
	application,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageApplicationModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		university_id: "",
		program_id: "",
		stage: "intro",
		start_date: format(new Date(), "yyyy-MM-dd"),
		origin_lead_list_id: "",
		origin_campaign_id: "",
		offer_notes: "",
	});

	useEffect(() => {
		if (isEdit && application) {
			setFormData({
				university_id: application.university_id || "",
				program_id: application.program_id || "",
				stage: application.stage || "intro",
				start_date: application.start_date
					? format(new Date(application.start_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				origin_lead_list_id: application.origin_lead_list_id || "",
				origin_campaign_id: application.origin_campaign_id || "",
				offer_notes: application.offer_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				university_id: "",
				program_id: "",
				stage: "intro",
				start_date: format(new Date(), "yyyy-MM-dd"),
				origin_lead_list_id: "",
				origin_campaign_id: "",
				offer_notes: "",
			});
		}
	}, [isEdit, application, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.university_id) {
			toast.error("University is required");
			return;
		}

		if (!formData.program_id) {
			toast.error("Program is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && application) {
				await updateAthleteApplication(application.id, {
					university_id: formData.university_id,
					program_id: formData.program_id,
					stage: formData.stage,
					start_date: formData.start_date,
					origin_lead_list_id: formData.origin_lead_list_id || undefined,
					origin_campaign_id: formData.origin_campaign_id || undefined,
					offer_notes: formData.offer_notes,
				});
				toast.success("Application updated successfully!");
			} else {
				await createAthleteApplication(athleteId, {
					university_id: formData.university_id,
					program_id: formData.program_id,
					stage: formData.stage,
					start_date: formData.start_date,
					origin_lead_list_id: formData.origin_lead_list_id || undefined,
					origin_campaign_id: formData.origin_campaign_id || undefined,
					offer_notes: formData.offer_notes,
				});
				toast.success("Application added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} application:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} application`);
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
							Add Offer
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GraduationCap className="h-5 w-5" />
						{isEdit ? "Edit Offer" : "Add New Offer"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the offer details."
							: "Add a new university offer for this athlete."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<UniversityLookup
						value={formData.university_id}
						onChange={(value) =>
							setFormData({ ...formData, university_id: value, program_id: "" })
						}
						label="University"
						required
					/>

					<ProgramLookup
						universityId={formData.university_id}
						value={formData.program_id}
						onChange={(value) =>
							setFormData({ ...formData, program_id: value })
						}
						label="Program"
						required
						disabled={!formData.university_id}
					/>

					{/* Stage */}
					<div className="space-y-2">
						<Label htmlFor="stage">Stage</Label>
						<Select
							value={formData.stage}
							onValueChange={(value) =>
								setFormData({ ...formData, stage: value })
							}
						>
							<SelectTrigger id="stage">
								<SelectValue placeholder="Select stage" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="intro">Introduction</SelectItem>
								<SelectItem value="ongoing">Ongoing</SelectItem>
								<SelectItem value="visit">Visit</SelectItem>
								<SelectItem value="offer">Offer Received</SelectItem>
								<SelectItem value="committed">Committed</SelectItem>
								<SelectItem value="dropped">Dropped</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Start Date */}
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

					<LeadListLookup
						athleteId={athleteId}
						value={formData.origin_lead_list_id}
						onChange={(value) =>
							setFormData({ ...formData, origin_lead_list_id: value })
						}
						label="Origin Lead List (Optional)"
						required={false}
					/>

					<CampaignLookup
						athleteId={athleteId}
						value={formData.origin_campaign_id}
						onChange={(value) =>
							setFormData({ ...formData, origin_campaign_id: value })
						}
						label="Origin Campaign (Optional)"
						required={false}
					/>

					{/* Offer Notes */}
					<div className="space-y-2">
						<Label htmlFor="offer_notes">Offer Notes</Label>
						<Textarea
							id="offer_notes"
							placeholder="Notes about offers or conditions"
							value={formData.offer_notes}
							onChange={(e) =>
								setFormData({ ...formData, offer_notes: e.target.value })
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
									? "Update Offer"
									: "Add Offer"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
