"use client";

import type { ReactNode } from "react";
import { useState } from "react";

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

import { CoachLookup } from "@/features/athletes/components/lookups/coach-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";

import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createUniversityJobAction } from "../actions/createUniversityJob";

interface CreateUniversityJobModalProps {
	universityId: string;
	children?: ReactNode;
}

export function CreateUniversityJobModal({
	universityId,
	children,
}: CreateUniversityJobModalProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		coach_id: null as string | null,
		program_id: null as string | null,
		program_scope: "n/a" as string,
		job_title: "",
		work_email: "",
		work_phone: "",
		start_date: "",
		end_date: "",
		internal_notes: "",
	});

	const { execute: executeCreate, isExecuting } = useAction(
		createUniversityJobAction,
		{
			onSuccess: () => {
				toast.success("University job created successfully!");
				setOpen(false);
				// Reset form
				setFormData({
					coach_id: null,
					program_id: null,
					program_scope: "n/a",
					job_title: "",
					work_email: "",
					work_phone: "",
					start_date: "",
					end_date: "",
					internal_notes: "",
				});
				// Invalidate queries
				queryClient.invalidateQueries({
					queryKey: ["universities", "detail", universityId],
				});
			},
			onError: () => {
				toast.error("Failed to create university job");
			},
		},
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		executeCreate({
			university_id: universityId,
			coach_id: formData.coach_id,
			program_id: formData.program_id,
			program_scope: formData.program_scope as "men" | "women" | "both" | "n/a",
			job_title: formData.job_title || null,
			work_email: formData.work_email || null,
			work_phone: formData.work_phone || null,
			start_date: formData.start_date || null,
			end_date: formData.end_date || null,
			internal_notes: formData.internal_notes || null,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				{children || (
					<Button variant="outline" size="sm" className="gap-2">
						<Plus className="h-4 w-4" />
						Add Coach/Staff Position
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Briefcase className="h-5 w-5" />
						Add New University Job
					</DialogTitle>
					<DialogDescription>
						Create a new coaching or staff position at this university.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label>Coach</Label>
							<CoachLookup
								value={formData.coach_id || ""}
								onChange={(value) =>
									setFormData({ ...formData, coach_id: value || null })
								}
								label=""
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Assign a coach to this role
							</p>
						</div>

						<div>
							<Label>Job Title</Label>
							<Input
								value={formData.job_title}
								onChange={(e) =>
									setFormData({ ...formData, job_title: e.target.value })
								}
								placeholder="e.g., Head Coach, Assistant Coach"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Role title (e.g., Assistant Coach)
							</p>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label>Program</Label>
							<ProgramLookup
								universityId={universityId}
								value={formData.program_id || ""}
								onChange={(value) =>
									setFormData({ ...formData, program_id: value || null })
								}
								label=""
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Tie to a specific program, if applicable
							</p>
						</div>

						<div>
							<Label>Program Scope</Label>
							<Select
								value={formData.program_scope}
								onValueChange={(value) =>
									setFormData({ ...formData, program_scope: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="men">Men</SelectItem>
									<SelectItem value="women">Women</SelectItem>
									<SelectItem value="both">Both</SelectItem>
									<SelectItem value="n/a">N/A</SelectItem>
								</SelectContent>
							</Select>
							<p className="mt-1 text-muted-foreground text-xs">
								Scope of responsibility (men, women, both, n/a)
							</p>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label>Work Email</Label>
							<Input
								type="email"
								value={formData.work_email}
								onChange={(e) =>
									setFormData({ ...formData, work_email: e.target.value })
								}
								placeholder="work@university.edu"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Email used for this role
							</p>
						</div>

						<div>
							<Label>Work Phone</Label>
							<Input
								type="tel"
								value={formData.work_phone}
								onChange={(e) =>
									setFormData({ ...formData, work_phone: e.target.value })
								}
								placeholder="(555) 123-4567"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Phone used for this role
							</p>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label>Start Date</Label>
							<Input
								type="date"
								value={formData.start_date}
								onChange={(e) =>
									setFormData({ ...formData, start_date: e.target.value })
								}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								When this job starts
							</p>
						</div>

						<div>
							<Label>End Date</Label>
							<Input
								type="date"
								value={formData.end_date}
								onChange={(e) =>
									setFormData({ ...formData, end_date: e.target.value })
								}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								When this job ends
							</p>
						</div>
					</div>

					<div>
						<Label>Internal Notes</Label>
						<Textarea
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							placeholder="Notes specific to this job/role..."
							rows={3}
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Notes specific to this job/role
						</p>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isExecuting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isExecuting}>
							{isExecuting ? "Creating..." : "Create University Job"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
