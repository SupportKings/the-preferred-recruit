import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { createColumnHelper } from "@tanstack/react-table";
import type { CampaignCoachData } from "../../types/coach-export-types";

const columnHelper = createColumnHelper<CampaignCoachData>();

export const coachExportColumns = [
	columnHelper.display({
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
		enableColumnFilter: false,
	}),
	columnHelper.accessor("coachName", {
		id: "coachName",
		header: "Coach Name",
		cell: ({ row }) => {
			const coach = row.original;
			const initials = coach.coachName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);

			return (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarFallback className="text-xs">{initials}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="font-medium">{coach.coachName}</span>
						{coach.coachEmail && (
							<span className="text-muted-foreground text-xs">
								{coach.coachEmail}
							</span>
						)}
					</div>
				</div>
			);
		},
	}),
	columnHelper.accessor("universityName", {
		id: "universityName",
		header: "University",
		cell: ({ row }) => {
			const coach = row.original;
			return (
				<div className="flex flex-col">
					<span className="font-medium">{coach.universityName || "—"}</span>
					{coach.city && coach.state && (
						<span className="text-muted-foreground text-xs">
							{coach.city}, {coach.state}
						</span>
					)}
				</div>
			);
		},
	}),
	columnHelper.accessor("programName", {
		id: "programName",
		header: "Program",
		cell: ({ row }) => {
			const coach = row.original;
			return (
				<div className="flex flex-col">
					<span>{coach.programName || "—"}</span>
					{coach.gender && (
						<span className="text-muted-foreground text-xs capitalize">
							{coach.gender}
						</span>
					)}
				</div>
			);
		},
	}),
	columnHelper.accessor("division", {
		id: "division",
		header: "Division",
		cell: ({ row }) => {
			const division = row.original.division;
			if (!division) return <span className="text-muted-foreground">—</span>;

			const colorMap: Record<string, string> = {
				"Division I":
					"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
				"Division II":
					"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
				"Division III":
					"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
			};

			return (
				<Badge variant="outline" className={colorMap[division] || ""}>
					{division}
				</Badge>
			);
		},
	}),
	columnHelper.accessor("tuition", {
		id: "tuition",
		header: "Tuition",
		cell: ({ row }) => {
			const tuition = row.original.tuition;
			if (!tuition) return <span className="text-muted-foreground">—</span>;

			return <span className="font-medium">${tuition.toLocaleString()}</span>;
		},
	}),
	columnHelper.accessor("jobTitle", {
		id: "jobTitle",
		header: "Job Title",
		cell: ({ row }) => {
			const coach = row.original;
			return (
				<div className="flex flex-col">
					<span>{coach.jobTitle || "—"}</span>
					{coach.workEmail && (
						<span className="text-muted-foreground text-xs">
							{coach.workEmail}
						</span>
					)}
				</div>
			);
		},
	}),
	columnHelper.accessor("state", {
		id: "state",
		header: "State",
		cell: ({ row }) => {
			const state = row.original.state;
			return <span>{state || "—"}</span>;
		},
	}),
	columnHelper.accessor("conferenceName", {
		id: "conferenceName",
		header: "Conference",
		cell: ({ row }) => {
			const conference = row.original.conferenceName;
			return <span>{conference || "—"}</span>;
		},
	}),
	columnHelper.accessor("institutionFlags", {
		id: "institutionFlags",
		header: "Institution Type",
		cell: ({ row }) => {
			const flags = row.original.institutionFlags;
			if (!flags) return <span className="text-muted-foreground">—</span>;

			return (
				<Badge variant="outline" className="font-normal">
					{flags}
				</Badge>
			);
		},
	}),
	columnHelper.accessor("usNewsNational", {
		id: "usNewsNational",
		header: "US News (Nat.)",
		cell: ({ row }) => {
			const ranking = row.original.usNewsNational;
			if (!ranking) return <span className="text-muted-foreground">—</span>;

			return <span className="tabular-nums">#{ranking}</span>;
		},
	}),
	columnHelper.accessor("usNewsLiberalArts", {
		id: "usNewsLiberalArts",
		header: "US News (L.A.)",
		cell: ({ row }) => {
			const ranking = row.original.usNewsLiberalArts;
			if (!ranking) return <span className="text-muted-foreground">—</span>;

			return <span className="tabular-nums">#{ranking}</span>;
		},
	}),
];
