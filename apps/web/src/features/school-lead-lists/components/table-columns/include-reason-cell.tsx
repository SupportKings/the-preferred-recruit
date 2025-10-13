"use client";

import { useState } from "react";

import { IncludeReasonDialog } from "./include-reason-dialog";

interface IncludeReasonCellProps {
	reason: string | null;
	universityName?: string;
	maxLength?: number;
}

export function IncludeReasonCell({
	reason,
	universityName,
	maxLength = 50,
}: IncludeReasonCellProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	if (!reason || reason.trim() === "") {
		return <span className="text-muted-foreground text-sm">Not specified</span>;
	}

	const truncatedReason =
		reason.length > maxLength ? `${reason.substring(0, maxLength)}...` : reason;
	const shouldTruncate = reason.length > maxLength;

	return (
		<>
			<button
				type="button"
				onClick={() => setIsDialogOpen(true)}
				className="cursor-pointer text-left text-sm transition-colors hover:text-primary hover:underline"
				title={shouldTruncate ? "Click to view full reason" : reason}
			>
				{truncatedReason}
			</button>
			<IncludeReasonDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				reason={reason}
				universityName={universityName}
			/>
		</>
	);
}
