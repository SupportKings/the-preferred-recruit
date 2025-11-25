"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import * as Dialog from "@radix-ui/react-dialog";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { deleteAthlete } from "@/features/athletes/actions/deleteAthlete";
import {
	athleteQueries,
	useAthlete,
} from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
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
	const queryClient = useQueryClient();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { execute: executeDeleteAthlete, isExecuting } = useAction(
		deleteAthlete,
		{
			onSuccess: (result) => {
				console.log("Delete result:", result);
				// result.data contains our action's return value
				if (result.data?.success) {
					// Store athlete name before clearing cache
					const athleteName = athlete?.full_name || "Athlete";

					// Close dialog first
					setIsDeleteDialogOpen(false);

					// Remove the athlete from cache to prevent refetch
					queryClient.removeQueries({
						queryKey: athleteQueries.detail(athleteId),
					});

					// Also invalidate the athletes list
					queryClient.invalidateQueries({
						queryKey: athleteQueries.lists(),
					});

					// Show success toast
					toast.success(`${athleteName} has been deleted successfully`);

					// Navigate to athletes list
					router.push("/dashboard/athletes");
				}
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
		<div className="sticky top-0 z-10 flex h-[45px] shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{athlete?.full_name
						? `${athlete.full_name} - Details`
						: "Athlete Details"}
				</h1>
			</div>
			<Dialog.Root
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-1.5 h-4 w-4" />
						Delete Athlete
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
					<Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-md transform rounded-lg bg-white p-6 shadow-lg dark:bg-gray-950">
						<Dialog.Title className="mb-4 font-semibold text-lg">
							Delete Athlete
						</Dialog.Title>
						<Dialog.Description className="mb-6 text-gray-600 dark:text-gray-400">
							Are you sure you want to delete{" "}
							{athlete?.full_name || "this athlete"}? This action cannot be
							undone.
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
