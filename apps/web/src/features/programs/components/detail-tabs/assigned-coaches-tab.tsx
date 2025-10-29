"use client";

import { useState } from "react";

import Link from "next/link";

import { formatLocalDate } from "@/lib/date-utils";

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

import { ExternalLink, Pencil, Trash2, Users } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { removeCoachFromProgramAction } from "../../actions/removeCoachFromProgram";
import { ManageProgramCoachModal } from "../manage-program-coach-modal";

interface AssignedCoachesTabProps {
	jobs: any[];
	programId: string;
	universityId: string;
	onRefresh: () => void;
}

export function AssignedCoachesTab({
	jobs,
	programId,
	universityId,
	onRefresh,
}: AssignedCoachesTabProps) {
	const [editingJob, setEditingJob] = useState<any>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const { execute: executeRemove, isExecuting: isRemoving } = useAction(
		removeCoachFromProgramAction,
		{
			onSuccess: () => {
				toast.success("Coach removed from program successfully");
				onRefresh();
			},
			onError: (err) => {
				console.error("Error removing coach:", err);
				toast.error(
					err.error.serverError || "Failed to remove coach. Please try again.",
				);
			},
		},
	);

	const handleEditClick = (job: any) => {
		setEditingJob(job);
		setIsEditModalOpen(true);
	};

	const handleEditSuccess = () => {
		setEditingJob(null);
		setIsEditModalOpen(false);
		onRefresh();
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Not set";
		return formatLocalDate(dateString, "MMM dd, yyyy");
	};

	if (jobs.length === 0) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Assigned Coaches
						</CardTitle>
						<ManageProgramCoachModal
							programId={programId}
							universityId={universityId}
							onSuccess={onRefresh}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No coaches assigned yet</p>
						<p className="mt-1 text-xs">
							Coaches will appear here once assigned to this program
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Assigned Coaches
					</CardTitle>
					<ManageProgramCoachModal
						programId={programId}
						universityId={universityId}
						onSuccess={onRefresh}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Coach</TableHead>
								<TableHead>Specialty</TableHead>
								<TableHead>Job Title</TableHead>
								<TableHead>University</TableHead>
								<TableHead>Program Scope</TableHead>
								<TableHead>Work Email</TableHead>
								<TableHead>Work Phone</TableHead>
								<TableHead>Start Date</TableHead>
								<TableHead>End Date</TableHead>
								<TableHead className="w-[50px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{jobs.map((job) => (
								<TableRow key={job.id}>
									<TableCell className="font-medium">
										{job.coaches?.id ? (
											<Link
												href={`/dashboard/coaches/${job.coaches.id}`}
												className="flex items-center gap-1 hover:underline"
											>
												{job.coaches.full_name}
												<ExternalLink className="h-3 w-3" />
											</Link>
										) : (
											"Unknown Coach"
										)}
									</TableCell>
									<TableCell className="capitalize">
										{job.coaches?.primary_specialty || "-"}
									</TableCell>
									<TableCell>{job.job_title || "-"}</TableCell>
									<TableCell>
										{job.universities?.name ? (
											<Link
												href={`/dashboard/universities/${job.universities.id}`}
												className="flex items-center gap-1 hover:underline"
											>
												{job.universities.name}
												<ExternalLink className="h-3 w-3" />
											</Link>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell className="capitalize">
										{job.program_scope || "-"}
									</TableCell>
									<TableCell>
										{job.work_email ? (
											<a
												href={`mailto:${job.work_email}`}
												className="hover:underline"
											>
												{job.work_email}
											</a>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell>{job.work_phone || "-"}</TableCell>
									<TableCell>{formatDate(job.start_date)}</TableCell>
									<TableCell>{formatDate(job.end_date)}</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEditClick(job)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													executeRemove({
														id: job.id,
														program_id: programId,
													})
												}
												disabled={isRemoving}
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
			</CardContent>
			{editingJob && (
				<ManageProgramCoachModal
					programId={programId}
					universityId={universityId}
					coachAssignment={editingJob}
					open={isEditModalOpen}
					onOpenChange={(open) => {
						setIsEditModalOpen(open);
						if (!open) {
							setEditingJob(null);
						}
					}}
					onSuccess={handleEditSuccess}
				/>
			)}
		</Card>
	);
}
