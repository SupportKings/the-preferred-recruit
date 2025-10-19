"use client";

import { type ReactNode, useEffect, useState } from "react";

import type { Tables } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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

import { createProgramAction } from "@/features/programs/actions/createProgram";
import { updateProgramAction } from "@/features/programs/actions/updateProgram";

import { Edit, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ManageProgramModalProps {
	universityId: string;
	mode: "add" | "edit";
	program?: Tables<"programs"> | null;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
}

export function ManageProgramModal({
	universityId,
	mode,
	program,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	onSuccess,
}: ManageProgramModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	const [formData, setFormData] = useState({
		gender: "",
		team_url: "",
		team_instagram: "",
		team_twitter: "",
		internal_notes: "",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && program) {
			setFormData({
				gender: program.gender || "",
				team_url: program.team_url || "",
				team_instagram: program.team_instagram || "",
				team_twitter: program.team_twitter || "",
				internal_notes: program.internal_notes || "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				gender: "",
				team_url: "",
				team_instagram: "",
				team_twitter: "",
				internal_notes: "",
			});
		}
	}, [isEdit, program, open]);

	// Create program action
	const {
		execute: executeCreate,
		isExecuting: isCreating,
		result: createResult,
	} = useAction(createProgramAction, {
		onSuccess: (result) => {
			// Check if the result contains data with success flag
			if (result?.data?.success) {
				toast.success("Program created successfully!");
				setOpen(false);
				onSuccess?.();
			}
		},
		onError: (err) => {
			console.error("Error creating program:", err);

			// Extract error message from validation errors
			const validationErrors = err.error?.validationErrors;
			if (validationErrors) {
				// Check for field-specific errors
				if (validationErrors.gender?._errors?.[0]) {
					toast.error(validationErrors.gender._errors[0]);
				} else if (validationErrors._errors?.[0]) {
					toast.error(validationErrors._errors[0]);
				} else if (validationErrors.team_url?._errors?.[0]) {
					toast.error(`Team URL: ${validationErrors.team_url._errors[0]}`);
				} else if (validationErrors.team_instagram?._errors?.[0]) {
					toast.error(
						`Team Instagram: ${validationErrors.team_instagram._errors[0]}`,
					);
				} else if (validationErrors.team_twitter?._errors?.[0]) {
					toast.error(
						`Team Twitter: ${validationErrors.team_twitter._errors[0]}`,
					);
				} else {
					toast.error("Validation error. Please check your inputs.");
				}
			} else {
				const errorMessage =
					err.error?.serverError ||
					"Failed to create program. Please try again.";
				toast.error(errorMessage);
			}
		},
	});

	// Update program action
	const {
		execute: executeUpdate,
		isExecuting: isUpdating,
		result: updateResult,
	} = useAction(updateProgramAction, {
		onSuccess: (result) => {
			// Check if the result contains data with success flag
			if (result?.data?.success) {
				toast.success("Program updated successfully!");
				setOpen(false);
				onSuccess?.();
			}
		},
		onError: (err) => {
			console.error("Error updating program:", err);

			// Extract error message from validation errors
			const validationErrors = err.error?.validationErrors;
			if (validationErrors) {
				// Check for field-specific errors
				if (validationErrors.gender?._errors?.[0]) {
					toast.error(validationErrors.gender._errors[0]);
				} else if (validationErrors._errors?.[0]) {
					toast.error(validationErrors._errors[0]);
				} else if (validationErrors.team_url?._errors?.[0]) {
					toast.error(`Team URL: ${validationErrors.team_url._errors[0]}`);
				} else if (validationErrors.team_instagram?._errors?.[0]) {
					toast.error(
						`Team Instagram: ${validationErrors.team_instagram._errors[0]}`,
					);
				} else if (validationErrors.team_twitter?._errors?.[0]) {
					toast.error(
						`Team Twitter: ${validationErrors.team_twitter._errors[0]}`,
					);
				} else {
					toast.error("Validation error. Please check your inputs.");
				}
			} else {
				const errorMessage =
					err.error?.serverError ||
					"Failed to update program. Please try again.";
				toast.error(errorMessage);
			}
		},
	});

	const isLoading = isCreating || isUpdating;

	const handleSubmit = async () => {
		if (!formData.gender) {
			toast.error("Please select a program gender");
			return;
		}

		if (isEdit && program) {
			executeUpdate({
				id: program.id,
				gender: formData.gender as "men" | "women",
				team_url: formData.team_url || null,
				team_instagram: formData.team_instagram || null,
				team_twitter: formData.team_twitter || null,
				internal_notes: formData.internal_notes || null,
			});
		} else {
			executeCreate({
				university_id: universityId,
				gender: formData.gender as "men" | "women",
				team_url: formData.team_url || null,
				team_instagram: formData.team_instagram || null,
				team_twitter: formData.team_twitter || null,
				internal_notes: formData.internal_notes || null,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							{isEdit ? (
								<>
									<Edit className="h-4 w-4" />
									Edit Program
								</>
							) : (
								<>
									<Plus className="h-4 w-4" />
									Add Program
								</>
							)}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit Program" : "Add Program"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update program information for this university."
							: "Create a new program for this university."}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="gender">Program Gender *</Label>
						<Select
							value={formData.gender}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, gender: value }))
							}
						>
							<SelectTrigger id="gender">
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="men">Men's</SelectItem>
								<SelectItem value="women">Women's</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="team_url">Team Website</Label>
						<Input
							id="team_url"
							type="text"
							placeholder="e.g., athletics.stanford.edu or https://..."
							value={formData.team_url}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, team_url: e.target.value }))
							}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="team_instagram">Team Instagram</Label>
						<Input
							id="team_instagram"
							type="text"
							placeholder="e.g., instagram.com/team or https://..."
							value={formData.team_instagram}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									team_instagram: e.target.value,
								}))
							}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="team_twitter">Team Twitter/X</Label>
						<Input
							id="team_twitter"
							type="text"
							placeholder="e.g., twitter.com/team or https://..."
							value={formData.team_twitter}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									team_twitter: e.target.value,
								}))
							}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes..."
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									internal_notes: e.target.value,
								}))
							}
							rows={3}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading
							? isEdit
								? "Saving..."
								: "Creating..."
							: isEdit
								? "Save Changes"
								: "Create Program"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
