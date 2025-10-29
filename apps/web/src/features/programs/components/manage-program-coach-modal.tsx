"use client";

import { useCallback, useEffect, useId, useState } from "react";

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

import { CoachLookup } from "@/features/athletes/components/lookups/coach-lookup";

import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { assignCoachToProgramAction } from "../actions/assignCoachToProgram";
import { updateCoachAssignmentAction } from "../actions/updateCoachAssignment";

interface ManageProgramCoachModalProps {
	programId: string;
	universityId: string;
	coachAssignment?: {
		id: string;
		coach_id: string;
		job_title: string | null;
		program_scope: string | null;
		work_email: string | null;
		work_phone: string | null;
		start_date: string | null;
		end_date: string | null;
		internal_notes: string | null;
	} | null;
	onSuccess?: () => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageProgramCoachModal({
	programId,
	universityId,
	coachAssignment,
	onSuccess,
	open: controlledOpen,
	onOpenChange,
}: ManageProgramCoachModalProps) {
	const isEditMode = !!coachAssignment;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = onOpenChange || setInternalOpen;

	const [coachId, setCoachId] = useState(coachAssignment?.coach_id || "");
	const [jobTitle, setJobTitle] = useState(coachAssignment?.job_title || "");
	const [programScope, setProgramScope] = useState<string>(
		coachAssignment?.program_scope || "",
	);
	const [workEmail, setWorkEmail] = useState(coachAssignment?.work_email || "");
	const [workPhone, setWorkPhone] = useState(coachAssignment?.work_phone || "");
	const [startDate, setStartDate] = useState<string>(
		coachAssignment?.start_date || "",
	);
	const [endDate, setEndDate] = useState<string>(
		coachAssignment?.end_date || "",
	);
	const [internalNotes, setInternalNotes] = useState(
		coachAssignment?.internal_notes || "",
	);

	const jobTitleId = useId();
	const workEmailId = useId();
	const workPhoneId = useId();
	const internalNotesId = useId();

	const { execute: executeAssign, isExecuting: isAssigning } = useAction(
		assignCoachToProgramAction,
		{
			onSuccess: (result) => {
				if (result?.data?.success) {
					toast.success("Coach assigned to program successfully!");
					setOpen(false);
					onSuccess?.();
				}
			},
			onError: (err) => {
				console.error("Error assigning coach:", err);

				const validationErrors = err.error?.validationErrors;
				if (validationErrors) {
					if (validationErrors.coach_id?._errors?.[0]) {
						toast.error(validationErrors.coach_id._errors[0]);
					} else if (validationErrors.work_email?._errors?.[0]) {
						toast.error(
							`Work Email: ${validationErrors.work_email._errors[0]}`,
						);
					} else if (validationErrors._errors?.[0]) {
						toast.error(validationErrors._errors[0]);
					} else {
						toast.error("Validation error. Please check your inputs.");
					}
				} else {
					const errorMessage =
						err.error?.serverError ||
						"Failed to assign coach. Please try again.";
					toast.error(errorMessage);
				}
			},
		},
	);

	const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
		updateCoachAssignmentAction,
		{
			onSuccess: (result) => {
				if (result?.data?.success) {
					toast.success("Coach assignment updated successfully!");
					setOpen(false);
					onSuccess?.();
				}
			},
			onError: (err) => {
				console.error("Error updating coach assignment:", err);

				const validationErrors = err.error?.validationErrors;
				if (validationErrors) {
					if (validationErrors.coach_id?._errors?.[0]) {
						toast.error(validationErrors.coach_id._errors[0]);
					} else if (validationErrors.work_email?._errors?.[0]) {
						toast.error(
							`Work Email: ${validationErrors.work_email._errors[0]}`,
						);
					} else if (validationErrors._errors?.[0]) {
						toast.error(validationErrors._errors[0]);
					} else {
						toast.error("Validation error. Please check your inputs.");
					}
				} else {
					const errorMessage =
						err.error?.serverError ||
						"Failed to update coach assignment. Please try again.";
					toast.error(errorMessage);
				}
			},
		},
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!coachId) {
			toast.error("Please select a coach");
			return;
		}

		if (isEditMode && coachAssignment) {
			executeUpdate({
				id: coachAssignment.id,
				program_id: programId,
				university_id: universityId,
				coach_id: coachId,
				job_title: jobTitle || null,
				program_scope:
					(programScope as "men" | "women" | "both" | "n/a") || null,
				work_email: workEmail || null,
				work_phone: workPhone || null,
				start_date: startDate || null,
				end_date: endDate || null,
				internal_notes: internalNotes || null,
			});
		} else {
			executeAssign({
				program_id: programId,
				university_id: universityId,
				coach_id: coachId,
				job_title: jobTitle || null,
				program_scope:
					(programScope as "men" | "women" | "both" | "n/a") || null,
				work_email: workEmail || null,
				work_phone: workPhone || null,
				start_date: startDate || null,
				end_date: endDate || null,
				internal_notes: internalNotes || null,
			});
		}
	};

	const resetForm = useCallback(() => {
		setCoachId("");
		setJobTitle("");
		setProgramScope("");
		setWorkEmail("");
		setWorkPhone("");
		setStartDate("");
		setEndDate("");
		setInternalNotes("");
	}, []);

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open, resetForm]);

	const isLoading = isAssigning || isUpdating;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{!isEditMode && (
				<DialogTrigger>
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Coach
					</Button>
				</DialogTrigger>
			)}
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Coach Assignment" : "Assign Coach to Program"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update coach assignment details for this program"
							: "Assign a coach to this program and specify their role details"}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<CoachLookup
						universityId={universityId}
						value={coachId}
						onChange={setCoachId}
						label="Coach"
						required
					/>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor={jobTitleId}>Job Title</Label>
							<Input
								id={jobTitleId}
								value={jobTitle}
								onChange={(e) => setJobTitle(e.target.value)}
								placeholder="e.g., Head Coach, Assistant Coach"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="program_scope">Program Scope</Label>
							<Select value={programScope} onValueChange={setProgramScope}>
								<SelectTrigger>
									<SelectValue placeholder="Select scope" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="men">Men's</SelectItem>
									<SelectItem value="women">Women's</SelectItem>
									<SelectItem value="both">Both</SelectItem>
									<SelectItem value="n/a">N/A</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor={workEmailId}>Work Email</Label>
							<Input
								id={workEmailId}
								type="email"
								value={workEmail}
								onChange={(e) => setWorkEmail(e.target.value)}
								placeholder="coach@university.edu"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={workPhoneId}>Work Phone</Label>
							<Input
								id={workPhoneId}
								value={workPhone}
								onChange={(e) => setWorkPhone(e.target.value)}
								placeholder="(555) 123-4567"
							/>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Start Date</Label>
							<DatePicker
								value={startDate}
								onChange={setStartDate}
								placeholder="Pick a date"
							/>
						</div>

						<div className="space-y-2">
							<Label>End Date</Label>
							<DatePicker
								value={endDate}
								onChange={setEndDate}
								placeholder="Pick a date"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor={internalNotesId}>Internal Notes</Label>
						<Textarea
							id={internalNotesId}
							value={internalNotes}
							onChange={(e) => setInternalNotes(e.target.value)}
							placeholder="Add any notes about this assignment..."
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || !coachId}>
							{isLoading
								? isEditMode
									? "Updating..."
									: "Assigning..."
								: isEditMode
									? "Update Assignment"
									: "Assign Coach"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
