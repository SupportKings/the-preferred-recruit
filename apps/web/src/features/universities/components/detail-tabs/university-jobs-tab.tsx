"use client";

import { useState } from "react";

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

import { format } from "date-fns";
import { Briefcase, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: UniversityJob | null;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const handleDelete = async (jobId: string) => {
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

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Briefcase className="h-5 w-5" />
					Coaches & Staff
				</CardTitle>
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
										<TableCell>{job.job_title || "-"}</TableCell>
										<TableCell className="capitalize">
											{job.programs?.gender || "-"}
										</TableCell>
										<TableCell className="capitalize">
											{job.program_scope || "-"}
										</TableCell>
										<TableCell>
											<div className="text-sm">
												{job.work_email && (
													<div className="max-w-[150px] truncate">
														{job.work_email}
													</div>
												)}
												{job.work_phone && <div>{job.work_phone}</div>}
												{!job.work_email && !job.work_phone && "-"}
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
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setEditModal({
															isOpen: true,
															type: "job",
															data: job,
														})
													}
												>
													<Edit2 className="h-4 w-4" />
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

			{/* TODO: Implement ManageUniversityJobModal component */}
			{/* <ManageUniversityJobModal
				universityId={universityId}
				job={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "job"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
				onSuccess={onRefresh}
			/> */}
		</Card>
	);
}
