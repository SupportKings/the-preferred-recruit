"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { deleteAthlete } from "@/features/athletes/actions/deleteAthlete";
import { useAthlete } from "@/features/athletes/queries/useAthletes";

import * as Dialog from "@radix-ui/react-dialog";
import { Trash2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface AthleteDetailHeaderProps {
	athleteId: string;
}

export default function AthleteDetailHeader({
	athleteId,
}: AthleteDetailHeaderProps) {
	const { data: athlete } = useAthlete(athleteId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { execute: executeDeleteAthlete, isExecuting } = useAction(
		deleteAthlete,
		{
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				toast.success(
					`${athlete?.full_name || "Athlete"} has been deleted successfully`,
				);
				router.push("/dashboard/athletes");
			},
			onError: (error) => {
				console.error("Failed to delete athlete:", error);
				toast.error("Failed to delete athlete. Please try again.");
			},
		},
	);

	const handleDeleteAthlete = () => {
		executeDeleteAthlete({ id: athleteId });
	};

	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{athlete?.full_name ? `${athlete.full_name} - Details` : "Athlete Details"}
				</h1>
			</div>
			<Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-[6px] h-4 w-4" />
						Delete Athlete
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6 w-full max-w-md z-50">
						<Dialog.Title className="text-lg font-semibold mb-4">
							Delete Athlete
						</Dialog.Title>
						<Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
							Are you sure you want to delete {athlete?.full_name || "this athlete"}? This action cannot be undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteAthlete}
								disabled={isExecuting}
							>
								{isExecuting ? "Deleting..." : "Delete"}
							</Button>
						</div>
						<Dialog.Close asChild>
							<Button variant="ghost" size="sm" className="absolute top-3 right-3 p-1">
								<X className="h-4 w-4" />
							</Button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
