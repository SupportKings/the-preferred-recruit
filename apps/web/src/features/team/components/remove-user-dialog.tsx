"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { removeUser } from "@/features/team/actions/removeUser";

import { useQueryClient } from "@tanstack/react-query";

interface RemoveUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	userName: string;
}

export default function RemoveUserDialog({
	open,
	onOpenChange,
	userId,
	userName,
}: RemoveUserDialogProps) {
	const queryClient = useQueryClient();

	const handleRemove = async () => {
		const result = await removeUser({
			userId,
		});

		if (result?.data?.success) {
			onOpenChange(false);
			// Invalidate and refetch users data
			queryClient.invalidateQueries({ queryKey: ["users"] });
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove User</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove <strong>{userName}</strong> from the
						team? This action cannot be undone and will permanently delete their
						account.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleRemove}
						className="bg-red-600 hover:bg-red-700"
					>
						Remove User
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
