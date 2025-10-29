"use client";

import { useState } from "react";

import Link from "next/link";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { updateReply } from "@/features/athlete-applications/actions/relations/replies";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const replyTypes = ["call", "text", "email", "instagram_dm"];

// Component for expandable text in a dialog
function ExpandableTextCell({
	text,
	title,
}: {
	text: string | null;
	title: string;
}) {
	if (!text) return <span className="text-muted-foreground">—</span>;

	return (
		<Dialog>
			<DialogTrigger className="h-auto max-w-md justify-start truncate p-0 text-left font-normal hover:bg-transparent hover:underline">
				<Eye className="mr-2 h-3 w-3 flex-shrink-0" />
				<span className="truncate">{text}</span>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<DialogDescription className="whitespace-pre-wrap text-sm">
					{text}
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}

// Component for inline-editable reply type
function InlineEditableReplyType({
	replyId,
	initialValue,
}: {
	replyId: string;
	initialValue: string;
}) {
	const [value, setValue] = useState(initialValue);
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = async (newValue: string) => {
		if (newValue === value) return;

		setIsLoading(true);
		try {
			await updateReply(replyId, { type: newValue });
			setValue(newValue);
			toast.success("Reply type updated");
		} catch (error) {
			console.error("Error updating reply type:", error);
			toast.error("Failed to update reply type");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Select value={value} onValueChange={handleChange} disabled={isLoading}>
			<SelectTrigger className="h-8 w-[140px] border-none bg-transparent hover:bg-accent">
				<SelectValue>
					<StatusBadge>
						{value
							.split("_")
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(" ")}
					</StatusBadge>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{replyTypes.map((type) => (
					<SelectItem key={type} value={type}>
						{type
							.split("_")
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(" ")}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export const createRepliesColumns = () => {
	const repliesColumnHelper = createColumnHelper<any>();
	return [
		repliesColumnHelper.accessor("type", {
			header: "Reply Type",
			cell: (info) => {
				const replyId = info.row.original.id;
				const type = info.getValue() || "email";
				return (
					<InlineEditableReplyType replyId={replyId} initialValue={type} />
				);
			},
		}),
		repliesColumnHelper.accessor("occurred_at", {
			header: "Occurred At",
			cell: (info) => formatDate(info.getValue()),
		}),
		repliesColumnHelper.accessor("summary", {
			header: "Summary",
			cell: (info) => (
				<ExpandableTextCell text={info.getValue()} title="Summary" />
			),
		}),
		repliesColumnHelper.accessor("internal_notes", {
			header: "Internal Notes",
			cell: (info) => (
				<ExpandableTextCell text={info.getValue()} title="Internal Notes" />
			),
		}),
		repliesColumnHelper.accessor("campaigns", {
			header: "Campaign",
			cell: (info) => {
				const campaign = info.getValue();
				if (!campaign) return <span className="text-muted-foreground">—</span>;

				return (
					<Link
						href={`/dashboard/campaigns/${campaign.id}`}
						className="font-medium hover:underline"
					>
						{campaign.name}
					</Link>
				);
			},
		}),
		repliesColumnHelper.accessor("university_jobs", {
			header: "Coach",
			cell: (info) => {
				const job = info.getValue();
				if (!job || !job.coaches)
					return <span className="text-muted-foreground">—</span>;

				const coachName = job.coaches.full_name || "Unknown";
				const jobTitle = job.job_title;

				// Link to coach detail page
				return (
					<Link
						href={`/dashboard/coaches/${job.coaches.id}`}
						className="group flex flex-col gap-0.5"
					>
						<span className="font-medium group-hover:underline">
							{coachName}
						</span>
						{jobTitle && (
							<span className="text-muted-foreground text-xs">{jobTitle}</span>
						)}
					</Link>
				);
			},
		}),
	];
};

export const createRepliesRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (reply: any) => {
			setEditModal({
				isOpen: true,
				type: "reply",
				data: reply,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (reply: any) => {
			setDeleteModal({
				isOpen: true,
				type: "reply",
				id: reply.id,
				title: `Delete reply from ${formatDate(reply.occurred_at)}`,
			});
		},
	},
];
