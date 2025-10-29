import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, ExternalLink, Eye, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatProgramGender = (gender: string | null) => {
	if (!gender) return "N/A";
	const genderLower = gender.toLowerCase();
	if (genderLower === "men") return "Men's Program";
	if (genderLower === "women") return "Women's Program";
	return gender;
};

type UniversityJobRow = {
	id: string;
	program_id: string | null;
	job_title: string | null;
	program_scope: string | null;
	work_email: string | null;
	work_phone: string | null;
	start_date: string | null;
	end_date: string | null;
	internal_notes: string | null;
	universities?: {
		id: string | null;
		name: string | null;
		city: string | null;
		region: string | null;
	} | null;
	programs?: {
		id: string | null;
		gender: string | null;
	} | null;
};

export const createUniversityJobsColumns = (
	onDelete?: (job: UniversityJobRow) => void,
) => {
	const columnHelper = createColumnHelper<UniversityJobRow>();
	const columns: any[] = [
		columnHelper.accessor("job_title", {
			header: "Job Title",
			cell: (info) => info.getValue() || "Unknown",
		}),
		columnHelper.accessor("universities.name", {
			header: "University",
			cell: (info) => {
				const universityName =
					info.getValue() || info.row.original.universities?.name || "Unknown";
				const universityId = info.row.original.universities?.id;

				if (!universityId) {
					return <span>{universityName}</span>;
				}

				return (
					<div className="flex items-center gap-2">
						<a
							href={`/dashboard/universities/${universityId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{universityName}
						</a>
						<a
							href={`/dashboard/universities/${universityId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80"
							onClick={(e) => e.stopPropagation()}
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				);
			},
		}),
		columnHelper.accessor("universities.city", {
			header: "City",
			cell: (info) =>
				info.getValue() || info.row.original.universities?.city || "Unknown",
		}),
		columnHelper.accessor("universities.region", {
			header: "Region",
			cell: (info) =>
				info.getValue() || info.row.original.universities?.region || "N/A",
		}),
		columnHelper.accessor("programs.gender", {
			header: "Program",
			cell: (info) => {
				const programGender =
					info.getValue() || info.row.original.programs?.gender;
				const programId =
					info.row.original.program_id || info.row.original.programs?.id;
				const formattedProgram = formatProgramGender(programGender ?? null);

				if (!programId) {
					return <span>{formattedProgram}</span>;
				}

				return (
					<div className="flex items-center gap-2">
						<a
							href={`/dashboard/programs/${programId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{formattedProgram}
						</a>
						<a
							href={`/dashboard/programs/${programId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80"
							onClick={(e) => e.stopPropagation()}
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				);
			},
		}),
		columnHelper.accessor("program_scope", {
			header: "Program Scope",
			cell: (info) => <StatusBadge>{info.getValue() || "N/A"}</StatusBadge>,
		}),
		columnHelper.accessor("work_email", {
			header: "Work Email",
			cell: (info) => info.getValue() || "No email",
		}),
		columnHelper.accessor("work_phone", {
			header: "Work Phone",
			cell: (info) => info.getValue() || "No phone",
		}),
		columnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		columnHelper.accessor("end_date", {
			header: "End Date",
			cell: (info) => formatDate(info.getValue()),
		}),
	];

	// Add view button column
	columns.push(
		columnHelper.display({
			id: "view",
			header: "",
			cell: (info) => (
				<a
					href={`/dashboard/university-jobs/${info.row.original.id}`}
					className="text-primary hover:text-primary/80"
					aria-label="View details"
				>
					<Eye className="h-4 w-4" />
				</a>
			),
		}),
	);

	// Add delete button column if handler provided
	if (onDelete) {
		columns.push(
			columnHelper.display({
				id: "actions",
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

export const createUniversityJobsRowActions = (
	onEdit: (job: UniversityJobRow) => void,
	onDelete: (job: UniversityJobRow) => void,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (job: UniversityJobRow) => {
			onEdit(job);
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (job: UniversityJobRow) => {
			onDelete(job);
		},
	},
];
