import { useState } from "react";

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

interface DeleteUniversityModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
	universityName?: string;
}

export function DeleteUniversityModal({
	isOpen,
	onOpenChange,
	onConfirm,
	universityName,
}: DeleteUniversityModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} catch (error) {
			console.error("Delete failed:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete University</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete{" "}
						{universityName ? `"${universityName}"` : "this university"}? This
						action cannot be undone and will remove all associated data.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
