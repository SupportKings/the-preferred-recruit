"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface InternalNotesDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	notes: string;
	universityName?: string;
}

export function InternalNotesDialog({
	isOpen,
	onOpenChange,
	notes,
	universityName,
}: InternalNotesDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Internal Notes</DialogTitle>
					<DialogDescription>
						{universityName ? `Notes for ${universityName}` : "Entry notes"}
					</DialogDescription>
				</DialogHeader>
				<div className="max-h-96 overflow-y-auto">
					<p className="whitespace-pre-wrap text-sm">{notes}</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
