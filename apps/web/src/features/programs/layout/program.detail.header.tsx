"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import * as Dialog from "@radix-ui/react-dialog";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { deleteProgramAction } from "@/features/programs/actions/deleteProgram";
import { useProgram } from "@/features/programs/queries/usePrograms";

import { Trash2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ProgramDetailHeaderProps {
	programId: string;
}

export default function ProgramDetailHeader({
	programId,
}: ProgramDetailHeaderProps) {
	const { data: program } = useProgram(programId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { execute: executeDeleteProgram, isExecuting } = useAction(
		deleteProgramAction,
		{
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				toast.success("Program has been deleted successfully");
				// Navigate back to the university page if we have the university_id
				if (program?.university_id) {
					router.push(`/dashboard/universities/${program.university_id}`);
				} else {
					router.push("/dashboard/universities");
				}
			},
			onError: (error) => {
				console.error("Failed to delete program:", error);
				toast.error("Failed to delete program. Please try again.");
			},
		},
	);

	const handleDeleteProgram = () => {
		executeDeleteProgram({ id: programId });
	};

	const programName = program
		? `${program.universities?.name || "Unknown"} - ${program.gender ? `${program.gender.charAt(0).toUpperCase()}${program.gender.slice(1)}'s` : "Program"}`
		: "Program Details";

	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">{programName}</h1>
			</div>
			<Dialog.Root
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-[6px] h-4 w-4" />
						Delete Program
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
					<Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-md transform rounded-lg bg-white p-6 shadow-lg">
						<Dialog.Title className="mb-4 font-semibold text-lg">
							Delete Program
						</Dialog.Title>
						<Dialog.Description className="mb-6 text-gray-600">
							Are you sure you want to delete this program? This action cannot
							be undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteProgram}
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
