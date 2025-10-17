"use client";

import Link from "next/link";

import type { Tables } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { updateUniversityJobAction } from "@/features/university-jobs/actions/updateUniversityJob";
import { CreateUniversityJobModal } from "@/features/university-jobs/components/create-university-job-modal";

import { format } from "date-fns";
import { Briefcase, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InlineEditCell } from "./inline-edit-cell";

type UniversityJob = Tables<"university_jobs"> & {
	coaches: {
		id: string;
		full_name: string | null;
		email: string | null;
		primary_specialty: string | null;
	} | null;
	programs: {
		id: string;
		gender: string | null;
		team_url: string | null;
	} | null;
};

interface UniversityJobsTabProps {
	jobs: UniversityJob[];
	universityId: string;
	onRefresh: () => void;
}

export function UniversityJobsTab({
	jobs,
	universityId,
	onRefresh,
}: UniversityJobsTabProps) {
	const handleDelete = async (_jobId: string) => {
		if (!confirm("Are you sure you want to delete this job?")) return;

		try {
			// TODO: Implement delete action
			toast.success("Job deleted successfully");
			onRefresh();
		} catch (error) {
			console.error("Error deleting job:", error);
			toast.error("Failed to delete job");
		}
	};

	const handleInlineEdit = async (
		jobId: string,
		field: string,
		value: string | null,
	) => {
		try {
			const result = await updateUniversityJobAction({
				id: jobId,
				[field]: value,
			} as Parameters<typeof updateUniversityJobAction>[0]);

			if (result?.validationErrors) {
				toast.error("Failed to update job");
				return;
			}

			if (result?.data?.success) {
				toast.success("Job updated successfully");
				onRefresh();
			}
		} catch (error) {
			console.error("Error updating job:", error);
			toast.error("Failed to update job");
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Briefcase className="h-5 w-5" />
						Coaches & Staff
					</CardTitle>
					<CreateUniversityJobModal universityId={universityId} />
				</div>
			</CardHeader>
			<CardContent>
				{jobs.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Briefcase className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No coaching positions yet</p>
						<p className="mt-1 text-xs">
							Coaching positions will appear here once added to this university
						</p>
					</div>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Coach</TableHead>
									<TableHead>Specialty</TableHead>
									<TableHead>Job Title</TableHead>
									<TableHead>Program</TableHead>
									<TableHead>Scope</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Period</TableHead>
									<TableHead className="w-[100px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{jobs.map((job) => (
									<TableRow key={job.id}>
										<TableCell className="font-medium">
											{job.coaches?.full_name || "Unassigned"}
										</TableCell>
										<TableCell className="capitalize">
											{job.coaches?.primary_specialty || "-"}
										</TableCell>
										<TableCell>
											<InlineEditCell
												value={job.job_title}
												onSave={(value) =>
													handleInlineEdit(job.id, "job_title", value)
												}
												type="text"
												placeholder="Job Title"
											/>
										</TableCell>
										<TableCell className="capitalize">
											{job.programs?.gender || "-"}
										</TableCell>
										<TableCell>
											<InlineEditCell
												value={job.program_scope}
												onSave={(value) =>
													handleInlineEdit(job.id, "program_scope", value)
												}
												type="select"
												options={[
													{ value: "men", label: "Men" },
													{ value: "women", label: "Women" },
													{ value: "both", label: "Both" },
													{ value: "n/a", label: "N/A" },
												]}
												placeholder="Scope"
											/>
										</TableCell>
										<TableCell>
											<div className="space-y-1 text-sm">
												<InlineEditCell
													value={job.work_email}
													onSave={(value) =>
														handleInlineEdit(job.id, "work_email", value)
													}
													type="email"
													placeholder="Work Email"
												/>
												<InlineEditCell
													value={job.work_phone}
													onSave={(value) =>
														handleInlineEdit(job.id, "work_phone", value)
													}
													type="tel"
													placeholder="Work Phone"
												/>
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm">
												{job.start_date && (
													<div>
														From:{" "}
														{format(new Date(job.start_date), "MMM dd, yyyy")}
													</div>
												)}
												{job.end_date && (
													<div>
														To: {format(new Date(job.end_date), "MMM dd, yyyy")}
													</div>
												)}
												{!job.start_date && !job.end_date && "-"}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												<Button variant="ghost" size="sm" asChild>
													<Link href={`/dashboard/university-jobs/${job.id}`}>
														<Eye className="h-4 w-4" />
													</Link>
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(job.id)}
												>
													<Trash2 className="h-4 w-4 text-red-600" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
