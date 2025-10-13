"use client";

import { useState } from "react";

import { InternalNotesDialog } from "./internal-notes-dialog";

interface InternalNotesCellProps {
	notes: string | null;
	universityName?: string;
	maxLength?: number;
}

export function InternalNotesCell({
	notes,
	universityName,
	maxLength = 50,
}: InternalNotesCellProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	if (!notes || notes.trim() === "") {
		return <span className="text-muted-foreground text-sm">No notes</span>;
	}

	const truncatedNotes =
		notes.length > maxLength ? `${notes.substring(0, maxLength)}...` : notes;
	const shouldTruncate = notes.length > maxLength;

	return (
		<>
			<button
				type="button"
				onClick={() => setIsDialogOpen(true)}
				className="cursor-pointer text-left text-sm transition-colors hover:text-primary hover:underline"
				title={shouldTruncate ? "Click to view full notes" : notes}
			>
				{truncatedNotes}
			</button>
			<InternalNotesDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				notes={notes}
				universityName={universityName}
			/>
		</>
	);
}
