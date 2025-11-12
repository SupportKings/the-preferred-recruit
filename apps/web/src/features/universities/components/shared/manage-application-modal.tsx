"use client";

import { type ReactNode, useEffect, useId, useState } from "react";

import type { Tables } from "@/utils/supabase/database.types";

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
} from "@/features/athlete-applications/actions/updateAthleteApplication";
import { AthleteLookup } from "@/features/athletes/components/lookups/athlete-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";

import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

type AthleteApplication = Tables<"athlete_applications">;

interface ManageApplicationModalProps {
	universityId: string;
	application?: AthleteApplication;
	mode: "add" | "edit";
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
}

export function ManageApplicationModal({
	universityId,
	application,
	mode,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	onSuccess,
}: ManageApplicationModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	// Generate unique IDs for form fields
	const stageId = useId();
	const startDateId = useId();
	const offerDateId = useId();
	const commitmentDateId = useId();
	const scholarshipAmountId = useId();
	const scholarshipPercentId = useId();
	const internalNotesId = useId();

	// Create application action
	const { execute: executeCreate, isExecuting: isCreating } = useAction(
		createAthleteApplication,
		{
			onSuccess: (result) => {
				if (result?.data?.success) {
					toast.success("Application created successfully!");
					onSuccess?.();
					setOpen(false);
				} else {
					toast.error(result?.data?.error || "Failed to create application");
				}
			},
			onError: (err) => {
				console.error("Error creating application:", err);
				toast.error("Failed to create application");
			},
		},
	);

	// Update application action
	const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
		updateAthleteApplication,
		{
			onSuccess: (result) => {
				if (result?.data?.success) {
					toast.success("Application updated successfully!");
					onSuccess?.();
					setOpen(false);
				} else {
					toast.error(result?.data?.error || "Failed to update application");
				}
			},
			onError: (err) => {
				console.error("Error updating application:", err);
				toast.error("Failed to update application");
			},
		},
	);

	const isLoading = isCreating || isUpdating;

	const [formData, setFormData] = useState({
		athlete_id: "",
		program_id: "",
		stage: "intro",
		start_date: "",
		offer_date: "",
		commitment_date: "",
		scholarship_amount_per_year: "",
		scholarship_percent: "",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && application) {
			setFormData({
				athlete_id: application.athlete_id || "",
				program_id: application.program_id || "",
				stage: application.stage || "intro",
				start_date: application.start_date
					? format(new Date(application.start_date), "yyyy-MM-dd")
					: "",
				offer_date: application.offer_date
					? format(new Date(application.offer_date), "yyyy-MM-dd")
					: "",
				commitment_date: application.commitment_date
					? format(new Date(application.commitment_date), "yyyy-MM-dd")
					: "",
				scholarship_amount_per_year:
					application.scholarship_amount_per_year?.toString() || "",
				scholarship_percent: application.scholarship_percent?.toString() || "",
				internal_notes: application.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				athlete_id: "",
				program_id: "",
				stage: "intro",
				start_date: "",
				offer_date: "",
				commitment_date: "",
				scholarship_amount_per_year: "",
				scholarship_percent: "",
				internal_notes: "",
			});
		}
	}, [isEdit, application]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.athlete_id) {
			toast.error("Athlete is required");
			return;
		}

		if (!formData.program_id) {
			toast.error("Program is required");
			return;
		}

		const payload = {
			university_id: universityId,
			athlete_id: formData.athlete_id,
			program_id: formData.program_id,
			stage: formData.stage as
				| "intro"
				| "ongoing"
				| "visit"
				| "offer"
				| "committed"
				| "dropped",
			start_date: formData.start_date || null,
			offer_date: formData.offer_date || null,
			commitment_date: formData.commitment_date || null,
			scholarship_amount_per_year: formData.scholarship_amount_per_year
				? Number(formData.scholarship_amount_per_year)
				: null,
			scholarship_percent: formData.scholarship_percent
				? Number(formData.scholarship_percent)
				: null,
			internal_notes: formData.internal_notes || null,
		};

		if (isEdit && application) {
			executeUpdate({
				id: application.id,
				...payload,
			});
		} else {
			executeCreate(payload);
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
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						{isEdit ? "Edit Offer" : "Add New Offer"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the offer details."
							: "Add a new athlete offer for this university."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<AthleteLookup
						value={formData.athlete_id}
						onChange={(value) =>
							setFormData({ ...formData, athlete_id: value })
						}
						label="Athlete"
						required
					/>

					<ProgramLookup
						universityId={universityId}
						value={formData.program_id}
						onChange={(value) =>
							setFormData({ ...formData, program_id: value })
						}
						label="Program"
						required
					/>

					{/* Stage */}
					<div className="space-y-2">
						<Label htmlFor={stageId}>
							Stage <span className="text-red-500">*</span>
						</Label>
						<Select
							value={formData.stage}
							onValueChange={(value) =>
								setFormData({ ...formData, stage: value })
							}
						>
							<SelectTrigger id={stageId}>
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

					{/* Offer Date */}
					<div className="space-y-2">
						<Label htmlFor={offerDateId}>Offer Date</Label>
						<DatePicker
							id={offerDateId}
							value={formData.offer_date}
							onChange={(value) =>
								setFormData({ ...formData, offer_date: value })
							}
							placeholder="Select offer date"
						/>
					</div>

					{/* Commitment Date */}
					<div className="space-y-2">
						<Label htmlFor={commitmentDateId}>Commitment Date</Label>
						<DatePicker
							id={commitmentDateId}
							value={formData.commitment_date}
							onChange={(value) =>
								setFormData({ ...formData, commitment_date: value })
							}
							placeholder="Select commitment date"
						/>
					</div>

					{/* Scholarship Amount Per Year */}
					<div className="space-y-2">
						<Label htmlFor={scholarshipAmountId}>Scholarship/Year (USD)</Label>
						<Input
							id={scholarshipAmountId}
							type="number"
							placeholder="Enter scholarship amount"
							value={formData.scholarship_amount_per_year}
							onChange={(e) =>
								setFormData({
									...formData,
									scholarship_amount_per_year: e.target.value,
								})
							}
						/>
					</div>

					{/* Scholarship Percent */}
					<div className="space-y-2">
						<Label htmlFor={scholarshipPercentId}>Scholarship %</Label>
						<Input
							id={scholarshipPercentId}
							type="number"
							min="0"
							max="100"
							placeholder="Enter scholarship percentage"
							value={formData.scholarship_percent}
							onChange={(e) =>
								setFormData({
									...formData,
									scholarship_percent: e.target.value,
								})
							}
						/>
					</div>

					{/* Internal Notes */}
					<div className="space-y-2">
						<Label htmlFor={internalNotesId}>Internal Notes</Label>
						<Textarea
							id={internalNotesId}
							placeholder="Add private notes about this application"
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
									: "Creating..."
								: isEdit
									? "Update Offer"
									: "Create Offer"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
