import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { Edit, ExternalLink, Eye, Trash2 } from "lucide-react";
import type { BallKnowledgeWithRelations } from "../../types/ball-knowledge";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatRelativeTime = (dateString: string | null) => {
	if (!dateString) return "Unknown";
	try {
		return formatDistanceToNow(new Date(dateString), { addSuffix: true });
	} catch {
		return "Unknown";
	}
};

export const createBallKnowledgeColumns = (
	onEdit?: (item: BallKnowledgeWithRelations) => void,
	onDelete?: (item: BallKnowledgeWithRelations) => void,
) => {
	const columnHelper = createColumnHelper<BallKnowledgeWithRelations>();
	const columns: ColumnDef<BallKnowledgeWithRelations>[] = [
		columnHelper.accessor("note", {
			header: "Note",
			cell: (info) => {
				const note = info.getValue();
				const maxLength = 30;
				const isLong = note.length > maxLength;
				const displayNote = isLong ? `${note.slice(0, maxLength)}...` : note;
				return (
					<div className="flex items-center gap-2 max-w-md">
						<p className="text-sm flex-1">{displayNote}</p>
						{isLong && (
							<Dialog>
								<DialogTrigger
									className="text-muted-foreground hover:text-foreground shrink-0"
									onClick={(e) => e.stopPropagation()}
								>
									<Eye className="h-4 w-4" />
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle>Full Note</DialogTitle>
									</DialogHeader>
									<div className="mt-4">
										<p className="text-sm whitespace-pre-wrap">{note}</p>
									</div>
								</DialogContent>
							</Dialog>
						)}
					</div>
				);
			},
		}),
		columnHelper.display({
			id: "about",
			header: "About",
			cell: (info) => {
				const aboutEntities: Array<{
					type: string;
					id: string;
					name: string;
					href: string;
				}> = [];

				const row = info.row.original;

				if (row.about_coach_id && row.about_coach_name) {
					aboutEntities.push({
						type: "coach",
						id: row.about_coach_id,
						name: row.about_coach_name,
						href: `/dashboard/coaches/${row.about_coach_id}`,
					});
				}

				if (row.about_university_id && row.about_university_name) {
					aboutEntities.push({
						type: "university",
						id: row.about_university_id,
						name: row.about_university_name,
						href: `/dashboard/universities/${row.about_university_id}`,
					});
				}

				if (row.about_program_id && row.about_program_gender) {
					aboutEntities.push({
						type: "program",
						id: row.about_program_id,
						name: `${row.about_program_gender.charAt(0).toUpperCase() + row.about_program_gender.slice(1)}'s Program`,
						href: `/dashboard/programs/${row.about_program_id}`,
					});
				}

				if (aboutEntities.length === 0) {
					return <span className="text-muted-foreground">N/A</span>;
				}

				return (
					<div className="flex flex-wrap gap-1">
						{aboutEntities.map((entity) => (
							<Link
								key={entity.id}
								href={entity.href}
								onClick={(e) => e.stopPropagation()}
								className="inline-flex items-center"
							>
								<Badge variant="outline" className="hover:bg-accent">
									{entity.name}
									<ExternalLink className="ml-1 h-3 w-3" />
								</Badge>
							</Link>
						))}
					</div>
				);
			},
		}),
		columnHelper.accessor("source_type", {
			header: "Source",
			cell: (info) => (
				<Badge variant="secondary">{info.getValue() || "N/A"}</Badge>
			),
		}),
		columnHelper.accessor("created_at", {
			header: "Added",
			cell: (info) => (
				<span className="text-muted-foreground text-sm">
					{formatRelativeTime(info.getValue())}
				</span>
			),
		}),
		columnHelper.accessor("review_after", {
			header: "Review Date",
			cell: (info) => (
				<span className="text-sm">{formatDate(info.getValue())}</span>
			),
		}),
	];

	// Add edit button column if handler provided
	if (onEdit) {
		columns.push(
			columnHelper.display({
				id: "edit",
				header: "",
				cell: (info) => (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit(info.row.original);
						}}
						className="text-primary hover:text-primary/80"
						aria-label="Edit"
					>
						<Edit className="h-4 w-4" />
					</button>
				),
			}),
		);
	}

	// Add delete button column if handler provided
	if (onDelete) {
		columns.push(
			columnHelper.display({
				id: "delete",
				header: "",
				cell: (info) => (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(info.row.original);
						}}
						className="text-destructive hover:text-destructive/80"
						aria-label="Delete"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				),
			}),
		);
	}

	return columns;
};

export const createBallKnowledgeRowActions = (
	onEdit: (item: BallKnowledgeWithRelations) => void,
	onDelete: (item: BallKnowledgeWithRelations) => void,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (item: BallKnowledgeWithRelations) => {
			onEdit(item);
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (item: BallKnowledgeWithRelations) => {
			onDelete(item);
		},
	},
];
