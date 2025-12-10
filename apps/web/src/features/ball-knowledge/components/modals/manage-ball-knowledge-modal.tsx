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

import { CoachLookup } from "@/features/athletes/components/lookups/coach-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import { UniversityLookup } from "@/features/athletes/components/lookups/university-lookup";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBallKnowledge } from "../../actions/createBallKnowledge";
import { updateBallKnowledge } from "../../actions/updateBallKnowledge";
import type { BallKnowledgeWithRelations } from "../../types/ball-knowledge";

interface ManageBallKnowledgeModalProps {
	mode: "add" | "edit";
	ballKnowledge?: BallKnowledgeWithRelations;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultAboutCoachId?: string;
	defaultAboutUniversityId?: string;
	defaultAboutProgramId?: string;
}

export function ManageBallKnowledgeModal({
	mode,
	ballKnowledge,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	defaultAboutCoachId,
	defaultAboutUniversityId,
	defaultAboutProgramId,
}: ManageBallKnowledgeModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	// Generate unique IDs for form fields
	const noteId = useId();
	const sourceTypeId = useId();
	const reviewAfterId = useId();
	const internalNotesId = useId();

	const [formData, setFormData] = useState({
		note: "",
		source_type: "",
		review_after: "",
		internal_notes: "",
		about_coach_id: defaultAboutCoachId || null,
		about_university_id: defaultAboutUniversityId || null,
		about_program_id: defaultAboutProgramId || null,
	});

	const resetForm = useCallback(() => {
		if (isEdit && ballKnowledge) {
			setFormData({
				note: ballKnowledge.note || "",
				source_type: ballKnowledge.source_type || "",
				review_after: ballKnowledge.review_after || "",
				internal_notes: ballKnowledge.internal_notes || "",
				about_coach_id: ballKnowledge.about_coach_id || null,
				about_university_id: ballKnowledge.about_university_id || null,
				about_program_id: ballKnowledge.about_program_id || null,
			});
		} else {
			setFormData({
				note: "",
				source_type: "",
				review_after: "",
				internal_notes: "",
				about_coach_id: defaultAboutCoachId || null,
				about_university_id: defaultAboutUniversityId || null,
				about_program_id: defaultAboutProgramId || null,
			});
		}
	}, [
		isEdit,
		ballKnowledge,
		defaultAboutCoachId,
		defaultAboutUniversityId,
		defaultAboutProgramId,
	]);

	useEffect(() => {
		if (open) {
			resetForm();
		}
	}, [open, resetForm]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate that note is provided
		if (!formData.note.trim()) {
			toast.error("Please enter a note");
			return;
		}

		// Validate that at least one "about" entity is selected
		if (
			!formData.about_coach_id &&
			!formData.about_university_id &&
			!formData.about_program_id
		) {
			toast.error(
				"Please select at least one entity (Coach, University, or Program)",
			);
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && ballKnowledge) {
				const result = await updateBallKnowledge({
					id: ballKnowledge.id,
					note: formData.note,
					source_type: formData.source_type || undefined,
					review_after: formData.review_after || undefined,
					internal_notes: formData.internal_notes || undefined,
					about_coach_id: formData.about_coach_id || undefined,
					about_university_id: formData.about_university_id || undefined,
					about_program_id: formData.about_program_id || undefined,
				});

				if (result?.serverError) {
					toast.error(result.serverError);
				} else {
					toast.success("Ball knowledge updated successfully");
					queryClient.invalidateQueries({ queryKey: ["ball-knowledge"] });
					setOpen(false);
				}
			} else {
				const result = await createBallKnowledge({
					note: formData.note,
					source_type: formData.source_type || undefined,
					review_after: formData.review_after || undefined,
					internal_notes: formData.internal_notes || undefined,
					about_coach_id: formData.about_coach_id || undefined,
					about_university_id: formData.about_university_id || undefined,
					about_program_id: formData.about_program_id || undefined,
				});

				if (result?.serverError) {
					toast.error(result.serverError);
				} else {
					toast.success("Ball knowledge created successfully");
					queryClient.invalidateQueries({ queryKey: ["ball-knowledge"] });
					setOpen(false);
				}
			}
		} catch (error) {
			console.error("Error saving ball knowledge:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Ball Knowledge" : "Add Ball Knowledge"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the ball knowledge details below."
							: "Add recruiting insights, coaching preferences, or important program details."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Note - Required */}
					<div className="space-y-2">
						<Label htmlFor={noteId}>
							Note <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id={noteId}
							value={formData.note}
							onChange={(e) =>
								setFormData({ ...formData, note: e.target.value })
							}
							placeholder="Enter recruiting insights, preferences, or important details..."
							rows={4}
							required
						/>
					</div>

					{/* About Entities Section */}
					<div className="space-y-3 border-t pt-4">
						<div>
							<Label className="text-base">
								About <span className="text-destructive">*</span>
							</Label>
							<p className="text-muted-foreground text-sm">
								Select at least one entity this note is about
							</p>
						</div>

						<CoachLookup
							value={formData.about_coach_id || undefined}
							onChange={(value) =>
								setFormData({ ...formData, about_coach_id: value })
							}
							label="Coach"
						/>

						<UniversityLookup
							value={formData.about_university_id || undefined}
							onChange={(value) =>
								setFormData({ ...formData, about_university_id: value })
							}
							label="University"
							disabled={!!defaultAboutUniversityId}
						/>

						<ProgramLookup
							universityId={formData.about_university_id || undefined}
							value={formData.about_program_id || undefined}
							onChange={(value) =>
								setFormData({ ...formData, about_program_id: value })
							}
							label="Program"
							disabled={!!defaultAboutProgramId}
						/>
					</div>

					{/* Optional Fields */}
					<div className="space-y-3 border-t pt-4">
						<Label className="text-base">Additional Details (Optional)</Label>

						<div className="space-y-2">
							<Label htmlFor={sourceTypeId}>Source Type</Label>
							<Select
								value={formData.source_type}
								onValueChange={(value) =>
									setFormData({ ...formData, source_type: value })
								}
							>
								<SelectTrigger id={sourceTypeId}>
									<SelectValue placeholder="Select source type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Email">Email</SelectItem>
									<SelectItem value="Call">Call</SelectItem>
									<SelectItem value="Text">Text</SelectItem>
									<SelectItem value="Meeting">Meeting</SelectItem>
									<SelectItem value="Visit">Visit</SelectItem>
									<SelectItem value="Event">Event</SelectItem>
									<SelectItem value="Social Media">Social Media</SelectItem>
									<SelectItem value="Other">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor={reviewAfterId}>Review After</Label>
							<DatePicker
								id={reviewAfterId}
								value={formData.review_after}
								onChange={(value) =>
									setFormData({ ...formData, review_after: value })
								}
								placeholder="Select review date"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={internalNotesId}>Internal Notes</Label>
							<Textarea
								id={internalNotesId}
								value={formData.internal_notes}
								onChange={(e) =>
									setFormData({ ...formData, internal_notes: e.target.value })
								}
								placeholder="Private notes for internal use..."
								rows={2}
							/>
						</div>
					</div>

					{/* Form Actions */}
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
							{isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
