"use client";

import { useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { FileText, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteImportJobAction } from "../actions/deleteImportJob";
import type { ImportJobWithUploader } from "../types/import-types";
import { ImportJobStatusBadge } from "./import-job-status-badge";

interface ImportJobsTableProps {
	jobs: ImportJobWithUploader[];
	onJobDeleted?: () => void;
}

export function ImportJobsTable({
	jobs,
	onJobDeleted,
}: ImportJobsTableProps) {
	const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

	const { execute: deleteJob } = useAction(deleteImportJobAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success("Import job deleted successfully");
				setDeletingJobId(null);
				if (onJobDeleted) {
					onJobDeleted();
				}
			} else if (result.data?.error) {
				toast.error(result.data.error);
				setDeletingJobId(null);
			}
		},
		onError: (error) => {
			toast.error("Failed to delete import job");
			setDeletingJobId(null);
		},
	});

	const handleDelete = (jobId: string) => {
		setDeletingJobId(jobId);
		deleteJob({ jobId });
	};

	const formatFileSize = (bytes: number | null) => {
		if (!bytes) return "Unknown";
		const mb = bytes / (1024 * 1024);
		return `${mb.toFixed(2)} MB`;
	};

	const getUploaderName = (job: ImportJobWithUploader) => {
		if (!job.uploader) return "Unknown";
		return `${job.uploader.first_name || ""} ${job.uploader.last_name || ""}`.trim() || job.uploader.email;
	};

	if (jobs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
				<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 text-lg font-semibold">No imports yet</h3>
				<p className="text-sm text-muted-foreground">
					Upload a coach data file to get started
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Status</TableHead>
						<TableHead>Filename</TableHead>
						<TableHead>Size</TableHead>
						<TableHead>Rows</TableHead>
						<TableHead>Uploaded By</TableHead>
						<TableHead>Uploaded</TableHead>
						<TableHead className="w-[70px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{jobs.map((job) => (
						<TableRow key={job.id}>
							<TableCell>
								<ImportJobStatusBadge status={job.status} />
							</TableCell>
							<TableCell className="font-medium">
								{job.original_filename}
							</TableCell>
							<TableCell>{formatFileSize(job.file_size_bytes)}</TableCell>
							<TableCell>
								{job.status === "completed" || job.status === "processing" ? (
									<div className="text-sm">
										{job.status === "completed" && (
											<div>
												<span className="font-medium text-green-600 dark:text-green-400">
													{job.success_count || 0}
												</span>{" "}
												success
												{job.error_count ? (
													<>
														,{" "}
														<span className="font-medium text-destructive">
															{job.error_count}
														</span>{" "}
														failed
													</>
												) : null}
											</div>
										)}
										{job.status === "processing" && (
											<div className="text-muted-foreground">
												{job.processed_rows || 0} / {job.total_rows || 0}
											</div>
										)}
									</div>
								) : (
									<span className="text-muted-foreground">
										{job.total_rows || "-"}
									</span>
								)}
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{getUploaderName(job)}
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{job.created_at
									? formatDistanceToNow(new Date(job.created_at), {
											addSuffix: true,
										})
									: "-"}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											disabled={deletingJobId === job.id}
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDelete(job.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
