"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { Database } from "@/utils/supabase/database.types";

import { DataTableFilter } from "@/components/data-table-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import {
	UniversalTableFilterSkeleton,
	UniversalTableSkeleton,
} from "@/components/universal-data-table/table-skeleton";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { UniversalDataTableWrapper } from "@/components/universal-data-table/universal-data-table-wrapper";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import { useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import {
	EditIcon,
	EyeIcon,
	GraduationCapIcon,
	MailIcon,
	MapPinIcon,
	MessageSquareIcon,
	SchoolIcon,
	TrashIcon,
	UserIcon,
} from "lucide-react";
import { useAthletesWithFaceted } from "../queries/useAthletes";

// Type for athlete row from Supabase
type AthleteRow = Database["public"]["Tables"]["athletes"]["Row"];

// Create column helper for TanStack table
const columnHelper = createColumnHelper<AthleteRow>();

// TanStack table column definitions
const athleteTableColumns = [
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
	columnHelper.accessor("full_name", {
		id: "full_name",
		header: "Full Name",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<a
				href={`/dashboard/athletes/${row.original.id}`}
				className="font-medium text-primary hover:underline"
			>
				{row.getValue("full_name")}
			</a>
		),
	}),
	columnHelper.accessor("graduation_year", {
		id: "graduation_year",
		header: "Graduation Year",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const year = row.getValue<number>("graduation_year");
			return <div className="text-sm">{year || "-"}</div>;
		},
	}),
	columnHelper.accessor("state", {
		id: "state",
		header: "State",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-sm">{row.getValue("state") || "-"}</div>
		),
	}),
	columnHelper.accessor("contact_email", {
		id: "contact_email",
		header: "Contact Email",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("contact_email") || "-"}
			</div>
		),
	}),
	columnHelper.accessor("discord_channel_url", {
		id: "discord_channel_url",
		header: "Discord Channel",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const url = row.getValue<string>("discord_channel_url");
			return url ? (
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary text-sm hover:underline"
				>
					View
				</a>
			) : (
				<span className="text-muted-foreground text-sm">-</span>
			);
		},
	}),
	columnHelper.accessor("high_school", {
		id: "high_school",
		header: "High School",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-sm">{row.getValue("high_school") || "-"}</div>
		),
	}),
	// TODO: Uncomment after adding gpa column to database and regenerating types
	// columnHelper.accessor("gpa", {
	// 	id: "gpa",
	// 	header: "GPA",
	// 	enableColumnFilter: true,
	// 	enableSorting: true,
	// 	cell: ({ row }) => {
	// 		const gpa = row.getValue<number>("gpa");
	// 		return <div className="text-sm">{gpa?.toFixed(2) || "-"}</div>;
	// 	},
	// }),
	columnHelper.accessor("sat_score", {
		id: "sat_score",
		header: "SAT",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const score = row.getValue<number>("sat_score");
			return <div className="text-sm">{score || "-"}</div>;
		},
	}),
	columnHelper.accessor("act_score", {
		id: "act_score",
		header: "ACT",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const score = row.getValue<number>("act_score");
			return <div className="text-sm">{score || "-"}</div>;
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<AthleteRow>();

const athleteFilterConfig = [
	universalColumnHelper
		.text("full_name")
		.displayName("Full Name")
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.number("graduation_year")
		.displayName("Graduation Year")
		.icon(GraduationCapIcon)
		.min(2000)
		.max(2050)
		.build(),
	universalColumnHelper
		.text("state")
		.displayName("State")
		.icon(MapPinIcon)
		.build(),
	universalColumnHelper
		.text("contact_email")
		.displayName("Contact Email")
		.icon(MailIcon)
		.build(),
	universalColumnHelper
		.text("discord_channel_url")
		.displayName("Discord Channel")
		.icon(MessageSquareIcon)
		.build(),
	universalColumnHelper
		.text("high_school")
		.displayName("High School")
		.icon(SchoolIcon)
		.build(),
	// TODO: Uncomment after adding gpa column to database and regenerating types
	// universalColumnHelper
	// 	.number("gpa")
	// 	.displayName("GPA")
	// 	.icon(GraduationCapIcon)
	// 	.min(0)
	// 	.max(5)
	// 	.build(),
	universalColumnHelper
		.number("sat_score")
		.displayName("SAT")
		.icon(GraduationCapIcon)
		.min(400)
		.max(1600)
		.build(),
	universalColumnHelper
		.number("act_score")
		.displayName("ACT")
		.icon(GraduationCapIcon)
		.min(1)
		.max(36)
		.build(),
];

function AthletesTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch athletes data with faceted data in single optimized call
	const {
		data: athletesWithFaceted,
		isLoading,
		isError,
		error,
	} = useAthletesWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		[], // No faceted columns needed - number ranges use static min/max values
	);

	// Extract data from combined result
	const athletesData = athletesWithFaceted
		? {
				data: athletesWithFaceted.athletes,
				count: athletesWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (athlete: AthleteRow) => {
				router.push(`/dashboard/athletes/${athlete.id}`);
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (athlete: AthleteRow) => {
				router.push(`/dashboard/athletes/${athlete.id}`);
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (athlete: AthleteRow) => {
				// TODO: Implement delete confirmation modal
				console.log("Delete athlete:", athlete.id);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<AthleteRow>({
			data: athletesData?.data || [],
			totalCount: athletesData?.count || 0,
			columns: athleteTableColumns,
			columnsConfig: athleteFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: {},
			enableSelection: true,
			pageSize: 25,
			serverSide: true,
			rowActions,
			isLoading,
			isError,
			error,
			onPaginationChange: (pageIndex) => {
				setCurrentPage(pageIndex);
			},
			onSortingChange: setSorting,
		});

	if (isError) {
		return (
			<div className="w-full">
				<div className="space-y-2 text-center">
					<p className="text-red-600">
						Error loading athletes: {error?.message}
					</p>
					<p className="text-muted-foreground text-sm">
						Please check your database connection and try again.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="flex items-center gap-2 pb-4">
				{isLoading ? (
					<UniversalTableFilterSkeleton />
				) : (
					<DataTableFilter
						filters={filterState}
						columns={filterColumns}
						actions={actions}
						strategy={strategy}
					/>
				)}
			</div>

			{isLoading ? (
				<UniversalTableSkeleton
					numCols={athleteTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No athletes found matching your filters"
					emptyStateAction={
						<Button size="sm" asChild>
							<a href="/dashboard/athletes/add">Add Athlete</a>
						</Button>
					}
				/>
			)}
		</div>
	);
}

export function AthletesDataTable() {
	return (
		<UniversalDataTableWrapper<AthleteRow>
			table="athletes"
			columns={athleteTableColumns}
			columnsConfig={athleteFilterConfig}
			urlStateKey="athleteFilters"
		>
			{(state) => <AthletesTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
