"use client";

import { useEffect, useState } from "react";

import { DataTableFilter } from "@/components/data-table-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import {
	UniversalTableFilterSkeleton,
	UniversalTableSkeleton,
} from "@/components/universal-data-table/table-skeleton";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { UniversalDataTableWrapper } from "@/components/universal-data-table/universal-data-table-wrapper";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import type { CoachRow } from "@/features/coaches/types/coach";

import { createColumnHelper } from "@tanstack/react-table";
import {
	AwardIcon,
	BriefcaseIcon,
	BuildingIcon,
	EditIcon,
	EyeIcon,
	InstagramIcon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
	PlusIcon,
	TrashIcon,
	UserIcon,
} from "lucide-react";
import { useCoachesWithFaceted } from "../queries/useCoaches";

// Create column helper for TanStack table
const columnHelper = createColumnHelper<CoachRow>();

// TanStack table column definitions
const coachTableColumns = [
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
		header: "Name",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<a
				href={`/dashboard/coaches/${row.original.id}`}
				className="font-medium text-primary hover:underline"
			>
				{row.getValue("full_name") || "N/A"}
			</a>
		),
	}),
	columnHelper.accessor("primary_specialty", {
		id: "primary_specialty",
		header: "Primary Specialty",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const specialty = row.getValue<string>("primary_specialty");
			return (
				<StatusBadge>
					{specialty
						? specialty.charAt(0).toUpperCase() + specialty.slice(1)
						: "N/A"}
				</StatusBadge>
			);
		},
	}),
	columnHelper.display({
		id: "work_email",
		header: "Work Email",
		enableColumnFilter: true,
		enableSorting: false,
		cell: ({ row }) => {
			const job = row.original.university_jobs?.[0];
			const workEmail = job?.work_email;
			const personalEmail = row.original.email;
			const displayEmail = workEmail || personalEmail;

			return (
				<div className="text-sm">
					{displayEmail || "N/A"}
					{workEmail && (
						<span className="ml-1 text-muted-foreground text-xs">(Work)</span>
					)}
					{!workEmail && personalEmail && (
						<span className="ml-1 text-muted-foreground text-xs">
							(Personal)
						</span>
					)}
				</div>
			);
		},
	}),
	columnHelper.accessor("instagram_profile", {
		id: "instagram_profile",
		header: "Instagram",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const instagram = row.getValue<string>("instagram_profile");
			return (
				<div className="text-sm">
					{instagram ? (
						<a
							href={
								instagram.startsWith("http")
									? instagram
									: `https://instagram.com/${instagram}`
							}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline"
						>
							{instagram}
						</a>
					) : (
						"N/A"
					)}
				</div>
			);
		},
	}),
	columnHelper.accessor("phone", {
		id: "phone",
		header: "Phone",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-sm">{row.getValue("phone") || "N/A"}</div>
		),
	}),
	columnHelper.display({
		id: "job_title",
		header: "Job Title",
		enableColumnFilter: true,
		enableSorting: false,
		cell: ({ row }) => {
			const job = row.original.university_jobs?.[0];
			return <div className="text-sm">{job?.job_title || "N/A"}</div>;
		},
	}),
	columnHelper.display({
		id: "university_name",
		header: "University",
		enableColumnFilter: true,
		enableSorting: false,
		cell: ({ row }) => {
			const job = row.original.university_jobs?.[0];
			return <div className="text-sm">{job?.universities?.name || "N/A"}</div>;
		},
	}),
	columnHelper.display({
		id: "university_state",
		header: "State",
		enableColumnFilter: true,
		enableSorting: false,
		cell: ({ row }) => {
			const job = row.original.university_jobs?.[0];
			return <StatusBadge>{job?.universities?.state || "N/A"}</StatusBadge>;
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<CoachRow>();

const coachFilterConfig = [
	universalColumnHelper
		.text("full_name")
		.displayName("Name")
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.option("primary_specialty")
		.displayName("Primary Specialty")
		.icon(AwardIcon)
		.build(),
	universalColumnHelper
		.text("work_email" as any)
		.displayName("Work Email")
		.icon(MailIcon)
		.build(),
	universalColumnHelper
		.text("instagram_profile")
		.displayName("Instagram")
		.icon(InstagramIcon)
		.build(),
	universalColumnHelper
		.text("phone")
		.displayName("Phone")
		.icon(PhoneIcon)
		.build(),
	universalColumnHelper
		.text("job_title" as any)
		.displayName("Job Title")
		.icon(BriefcaseIcon)
		.build(),
	universalColumnHelper
		.text("university_name" as any)
		.displayName("University")
		.icon(BuildingIcon)
		.build(),
	universalColumnHelper
		.text("university_state" as any)
		.displayName("State")
		.icon(MapPinIcon)
		.build(),
];

function CoachesTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, []);

	// Fetch coaches data with faceted data in single optimized call
	const {
		data: coachesWithFaceted,
		isLoading,
		isError,
		error,
	} = useCoachesWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		["primary_specialty"], // columns to get faceted data for
	);

	// Extract data from combined result
	const coachesData = coachesWithFaceted
		? {
				data: coachesWithFaceted.coaches,
				count: coachesWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const specialtyFaceted = coachesWithFaceted?.facetedData?.primary_specialty;

	// Build dynamic options from faceted data
	const specialtyOptions = specialtyFaceted
		? Array.from(specialtyFaceted.keys()).map((specialty) => ({
				value: specialty,
				label: specialty.charAt(0).toUpperCase() + specialty.slice(1),
			}))
		: [];

	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		universalColumnHelper
			.text("full_name")
			.displayName("Name")
			.icon(UserIcon)
			.build(),
		{
			...universalColumnHelper
				.option("primary_specialty")
				.displayName("Primary Specialty")
				.icon(AwardIcon)
				.build(),
			options: specialtyOptions,
		},
		universalColumnHelper
			.text("work_email" as any)
			.displayName("Work Email")
			.icon(MailIcon)
			.build(),
		universalColumnHelper
			.text("instagram_profile")
			.displayName("Instagram")
			.icon(InstagramIcon)
			.build(),
		universalColumnHelper
			.text("phone")
			.displayName("Phone")
			.icon(PhoneIcon)
			.build(),
		universalColumnHelper
			.text("job_title" as any)
			.displayName("Job Title")
			.icon(BriefcaseIcon)
			.build(),
		universalColumnHelper
			.text("university_name" as any)
			.displayName("University")
			.icon(BuildingIcon)
			.build(),
		universalColumnHelper
			.text("university_state" as any)
			.displayName("State")
			.icon(MapPinIcon)
			.build(),
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (coach: CoachRow) => {
				window.location.href = `/dashboard/coaches/${coach.id}`;
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (coach: CoachRow) => {
				window.location.href = `/dashboard/coaches/${coach.id}`;
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (coach: CoachRow) => {
				// Will be handled via detail page
				window.location.href = `/dashboard/coaches/${coach.id}`;
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<CoachRow>({
			data: coachesData?.data || [],
			totalCount: coachesData?.count || 0,
			columns: coachTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: {
				primary_specialty: specialtyFaceted,
			},
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
						Error loading coaches: {error?.message}
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
					numCols={coachTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No coaches found matching your filters"
					emptyStateAction={
						<Button size="sm" disabled>
							<PlusIcon className="h-4 w-4" />
							Add Coach
						</Button>
					}
				/>
			)}
		</div>
	);
}

export function CoachesDataTable() {
	return (
		<UniversalDataTableWrapper<CoachRow>
			table="coaches"
			columns={coachTableColumns}
			columnsConfig={coachFilterConfig}
			urlStateKey="coachFilters"
		>
			{(state) => <CoachesTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
