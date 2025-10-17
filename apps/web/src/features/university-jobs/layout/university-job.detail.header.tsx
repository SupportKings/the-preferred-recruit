"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import * as Dialog from "@radix-ui/react-dialog";
import { Trash2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteUniversityJob } from "../actions/deleteUniversityJob";
import { useUniversityJob } from "../queries/useUniversityJobs";

interface UniversityJobDetailHeaderProps {
	universityJobId: string;
}

export default function UniversityJobDetailHeader({
	universityJobId,
}: UniversityJobDetailHeaderProps) {
	const { data: universityJob } = useUniversityJob(universityJobId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { execute: executeDeleteUniversityJob, isExecuting } = useAction(
		deleteUniversityJob,
		{
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				toast.success("University job has been deleted successfully");
				router.push("/dashboard/university-jobs");
			},
			onError: (error) => {
				console.error("Failed to delete university job:", error);
				toast.error("Failed to delete university job. Please try again.");
			},
		},
	);

	const handleDeleteUniversityJob = () => {
		executeDeleteUniversityJob({ id: universityJobId });
	};

	const getDisplayName = () => {
		if (!universityJob) return "University Job Details";

		const parts = [];
		if (universityJob.coaches?.full_name) {
			parts.push(universityJob.coaches.full_name);
		}
		if (universityJob.job_title) {
			parts.push(universityJob.job_title);
		}
		if (universityJob.universities?.name) {
			parts.push(universityJob.universities.name);
		}

		return parts.length > 0 ? `${parts.join(" - ")} - Details` : "University Job Details";
	};

	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">{getDisplayName()}</h1>
			</div>
			<Dialog.Root
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-[6px] h-4 w-4" />
						Delete University Job
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-lg">
						<Dialog.Title className="mb-4 font-semibold text-lg">
							Delete University Job
						</Dialog.Title>
						<Dialog.Description className="mb-6 text-gray-600">
							Are you sure you want to delete this university job? This action
							cannot be undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteUniversityJob}
								disabled={isExecuting}
							>
								{isExecuting ? "Deleting..." : "Delete"}
							</Button>
						</div>
						<Dialog.Close asChild>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-3 right-3 p-1"
							>
								<X className="h-4 w-4" />
							</Button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
