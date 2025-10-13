"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface IncludeReasonDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	reason: string;
	universityName?: string;
}

export function IncludeReasonDialog({
	isOpen,
	onOpenChange,
	reason,
	universityName,
}: IncludeReasonDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Include Reason</DialogTitle>
					<DialogDescription>
						{universityName
							? `Reason for including ${universityName}`
							: "Reason for including this lead"}
					</DialogDescription>
				</DialogHeader>
				<div className="max-h-96 overflow-y-auto">
					<p className="whitespace-pre-wrap text-sm">{reason}</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
