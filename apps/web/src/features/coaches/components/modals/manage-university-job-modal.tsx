"use client";

import { type ReactNode, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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

import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import { UniversityLookup } from "@/features/athletes/components/lookups/university-lookup";
import { createUniversityJobAction } from "@/features/university-jobs/actions/createUniversityJob";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { coachQueries } from "../../queries/useCoaches";

interface ManageUniversityJobModalProps {
	coachId: string;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageUniversityJobModal({
	coachId,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageUniversityJobModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const [formData, setFormData] = useState({
		university_id: "",
		program_id: "",
		program_scope: "n/a" as "men" | "women" | "both" | "n/a",
		job_title: "",
		work_email: "",
		work_phone: "",
		start_date: "",
		end_date: "",
		internal_notes: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.university_id) {
			toast.error("University is required");
			return;
		}

		setIsLoading(true);

		try {
			const result = await createUniversityJobAction({
				coach_id: coachId,
				university_id: formData.university_id,
				program_id: formData.program_id || null,
				program_scope: formData.program_scope || null,
				job_title: formData.job_title || null,
				work_email: formData.work_email || null,
				work_phone: formData.work_phone || null,
				start_date: formData.start_date || null,
				end_date: formData.end_date || null,
				internal_notes: formData.internal_notes || null,
			});

			if (result?.validationErrors) {
				const errorMessages: string[] = [];

				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}

				Object.entries(result.validationErrors).forEach(([field, errors]) => {
					if (field !== "_errors" && errors) {
						if (Array.isArray(errors)) {
							errorMessages.push(...errors);
						} else if (
							errors &&
							typeof errors === "object" &&
							"_errors" in errors &&
							Array.isArray(errors._errors)
						) {
							errorMessages.push(...errors._errors);
						}
					}
				});

				if (errorMessages.length > 0) {
					for (const error of errorMessages) {
						toast.error(error);
					}
				} else {
					toast.error("Failed to create university job");
				}
				setIsLoading(false);
				return;
			}

			if (result?.data?.data?.success && result.data.data.universityJob) {
				toast.success("University job created successfully!");

				// Invalidate coach queries
				await queryClient.invalidateQueries({
					queryKey: coachQueries.detail(coachId),
				});

				setOpen(false);

				// Navigate to the newly created university job detail page
				router.push(
					`/dashboard/university-jobs/${result.data.data.universityJob.id}`,
				);
			} else {
				toast.error("Failed to create university job");
			}
		} catch (error) {
			console.error("Error creating university job:", error);
			toast.error("Failed to create university job");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add University Job</DialogTitle>
					<DialogDescription>
						Create a new university job position for this coach.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* University (Required) */}
					<UniversityLookup
						value={formData.university_id}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, university_id: value }))
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

					{/* Job Title */}
					<div className="space-y-2">
						<Label htmlFor="job_title">Job Title</Label>
						<Input
							id="job_title"
							placeholder="e.g., Assistant Coach, Head Coach"
							value={formData.job_title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, job_title: e.target.value }))
							}
						/>
					</div>

					{/* Program Scope */}
					<div className="space-y-2">
						<Label htmlFor="program_scope">Program Scope</Label>
						<Select
							value={formData.program_scope}
							onValueChange={(value: "men" | "women" | "both" | "n/a") =>
								setFormData((prev) => ({ ...prev, program_scope: value }))
							}
						>
							<SelectTrigger id="program_scope">
								<SelectValue placeholder="Select program scope" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="men">Men</SelectItem>
								<SelectItem value="women">Women</SelectItem>
								<SelectItem value="both">Both</SelectItem>
								<SelectItem value="n/a">N/A</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Work Email */}
					<div className="space-y-2">
						<Label htmlFor="work_email">Work Email</Label>
						<Input
							id="work_email"
							type="email"
							placeholder="work@university.edu"
							value={formData.work_email}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, work_email: e.target.value }))
							}
						/>
					</div>

					{/* Work Phone */}
					<div className="space-y-2">
						<Label htmlFor="work_phone">Work Phone</Label>
						<Input
							id="work_phone"
							type="tel"
							placeholder="(555) 555-5555"
							value={formData.work_phone}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, work_phone: e.target.value }))
							}
						/>
					</div>

					{/* Start Date */}
					<div className="space-y-2">
						<Label htmlFor="start_date">Start Date</Label>
						<DatePicker
							value={formData.start_date}
							onChange={(value) =>
								setFormData((prev) => ({
									...prev,
									start_date: value,
								}))
							}
							placeholder="Select start date"
						/>
					</div>

					{/* End Date */}
					<div className="space-y-2">
						<Label htmlFor="end_date">End Date</Label>
						<DatePicker
							value={formData.end_date}
							onChange={(value) =>
								setFormData((prev) => ({
									...prev,
									end_date: value,
								}))
							}
							placeholder="Select end date"
						/>
					</div>

					{/* Internal Notes */}
					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this job position"
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
							{isLoading ? "Creating..." : "Create Job"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
