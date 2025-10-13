"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import * as Dialog from "@radix-ui/react-dialog";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useSchoolLeadList } from "@/features/school-lead-lists/queries/useSchoolLeadLists";

import { Trash2Icon, X } from "lucide-react";
import { toast } from "sonner";

interface SchoolLeadListDetailHeaderProps {
	leadListId: string;
}

export default function SchoolLeadListDetailHeader({
	leadListId,
}: SchoolLeadListDetailHeaderProps) {
	const { data: leadList } = useSchoolLeadList(leadListId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteLeadList = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/school-lead-lists/${leadListId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete lead list");
			}

			setIsDeleteDialogOpen(false);
			toast.success(
				`${leadList?.name || "Lead list"} has been deleted successfully`,
			);
			router.push("/dashboard/athletes");
		} catch (error) {
			console.error("Failed to delete lead list:", error);
			toast.error("Failed to delete lead list. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{leadList?.name ? `${leadList.name} - Details` : "Lead List Details"}
				</h1>
			</div>
			<Dialog.Root
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-[6px] h-4 w-4" />
						Delete Lead List
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
					<Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-md transform rounded-lg bg-white p-6 shadow-lg">
						<Dialog.Title className="mb-4 font-semibold text-lg">
							Delete Lead List
						</Dialog.Title>
						<Dialog.Description className="mb-6 text-gray-600">
							Are you sure you want to delete{" "}
							{leadList?.name || "this lead list"}? This action cannot be
							undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteLeadList}
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete"}
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
