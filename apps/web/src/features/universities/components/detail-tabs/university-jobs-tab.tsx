"use client";

import { useState } from "react";

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

import { deleteUniversityJob } from "@/features/university-jobs/actions/deleteUniversityJob";
import { updateUniversityJobAction } from "@/features/university-jobs/actions/updateUniversityJob";
import { CreateUniversityJobModal } from "@/features/university-jobs/components/create-university-job-modal";
import { DeleteConfirmModal } from "@/features/university-jobs/components/shared/delete-confirm-modal";

import { formatLocalDate as format } from "@/lib/date-utils";
import { Briefcase, ExternalLink, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InlineEditCell } from "./inline-edit-cell";

type UniversityJob = Tables<"university_jobs"> & {
	coaches: {
		id: string;
		full_name: string | null;
		email: string | null;
		primary_specialty: string | null;
		linkedin_profile: string | null;
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
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [jobToDelete, setJobToDelete] = useState<string | null>(null);

	const handleDeleteClick = (jobId: string) => {
		setJobToDelete(jobId);
		setDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!jobToDelete) return;

		try {
			const result = await deleteUniversityJob({ id: jobToDelete });

			if (result?.data?.success) {
				toast.success("Job deleted successfully");
				onRefresh();
			} else {
				toast.error(result?.data?.error || "Failed to delete job");
			}
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
						University Jobs (Coaches)
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
									<TableHead>Contact</TableHead>
									<TableHead>Period</TableHead>
									<TableHead className="w-[100px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{jobs.map((job) => (
									<TableRow key={job.id}>
										<TableCell className="font-medium">
											{job.coaches?.full_name ? (
												<div className="flex items-center gap-2">
													<Link
														href={`/dashboard/coaches/${job.coaches.id}`}
														className="text-primary hover:underline"
													>
														{job.coaches.full_name}
													</Link>
													<Link
														href={`/dashboard/coaches/${job.coaches.id}`}
														className="text-muted-foreground hover:text-primary"
														title="View coach details"
													>
														<ExternalLink className="h-3.5 w-3.5" />
													</Link>
												</div>
											) : (
												<span className="text-muted-foreground">
													{job.coaches ? "Unnamed Coach" : "Unassigned"}
												</span>
											)}
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
										<TableCell>
											{job.programs ? (
												<div className="flex items-center gap-2">
													<Link
														href={`/dashboard/programs/${job.programs.id}`}
														className="text-primary hover:underline"
													>
														{job.programs.gender === "men"
															? "Men's Program"
															: job.programs.gender === "women"
																? "Women's Program"
																: "Program"}
													</Link>
													{job.programs.team_url && (
														<a
															href={job.programs.team_url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-muted-foreground hover:text-primary"
															title="Visit team website"
														>
															<ExternalLink className="h-3.5 w-3.5" />
														</a>
													)}
												</div>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
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
												{job.start_date ? (
													<div>
														{format(job.start_date, "MMM dd, yyyy")}
														{job.end_date &&
															` - ${format(job.end_date, "MMM dd, yyyy")}`}
													</div>
												) : (
													"-"
												)}
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
													onClick={() => handleDeleteClick(job.id)}
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
			<DeleteConfirmModal
				isOpen={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				onConfirm={handleDeleteConfirm}
				title="Delete University Job"
				description="Are you sure you want to delete this coaching position? This action cannot be undone."
			/>
		</Card>
	);
}
