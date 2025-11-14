"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import * as Dialog from "@radix-ui/react-dialog";

import { Constants } from "@/utils/supabase/database.types";

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

import { deleteAthleteApplication } from "@/features/athlete-applications/actions/deleteAthleteApplication";

import { createColumnHelper } from "@tanstack/react-table";
import { formatLocalDate as format } from "@/lib/date-utils";
import {
	CalendarIcon,
	EditIcon,
	EyeIcon,
	PlusIcon,
	TagIcon,
	TrashIcon,
	UniversityIcon,
	User2Icon,
	X,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
	useApplicationsWithFaceted,
	useAthletes,
	usePrograms,
	useUniversities,
} from "../queries/useApplications";
import type { Application } from "../types/application";

// Create column helper for TanStack table
const columnHelper = createColumnHelper<Application>();

// Define color mapping for application stages
const stageColorMap: Record<
	string,
	"green" | "red" | "yellow" | "blue" | "purple" | "gray" | "orange"
> = {
	intro: "blue", // Info/process state
	ongoing: "orange", // Neutral/waiting state
	visit: "yellow", // Warning/caution state
	offer: "purple", // Special/featured state
	committed: "green", // Success/positive state
	dropped: "red", // Error/negative state
};

// Get stage options from database constants with colors
const stageOptions = Constants.public.Enums.application_stage_enum.map(
	(stage) => ({
		value: stage,
		label: stage.charAt(0).toUpperCase() + stage.slice(1),
		colorScheme: stageColorMap[stage] || "gray",
	}),
);

// TanStack table column definitions
const applicationTableColumns = [
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
	columnHelper.display({
		id: "athlete",
		header: "Athlete",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const athlete = row.original.athlete;
			return (
				<div className="flex flex-col gap-0.5">
					<div className="font-medium">{athlete?.full_name || "—"}</div>
					{athlete?.graduation_year && (
						<div className="text-muted-foreground text-xs">
							Class of {athlete.graduation_year}
						</div>
					)}
				</div>
			);
		},
	}),
	columnHelper.display({
		id: "university",
		header: "University",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const university = row.original.university;
			return (
				<div className="flex flex-col gap-0.5">
					<div className="font-medium">{university?.name || "—"}</div>
					{university?.state && (
						<div className="text-muted-foreground text-xs">
							{university.state}
						</div>
					)}
				</div>
			);
		},
	}),
	columnHelper.display({
		id: "program",
		header: "Program",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const program = row.original.program;
			return (
				<div className="flex flex-col gap-0.5">
					<div className="font-medium">
						{program?.gender
							? `${program.gender.charAt(0).toUpperCase()}${program.gender.slice(1)}'s`
							: "—"}
					</div>
					{program?.team_url && (
						<Link
							href={program.team_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary text-xs hover:underline"
						>
							Team Page
						</Link>
					)}
				</div>
			);
		},
	}),
	columnHelper.accessor("stage", {
		id: "stage",
		header: "Stage",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const stage = row.getValue<string>("stage");
			const colorScheme = stage ? stageColorMap[stage] || "gray" : "gray";
			return (
				<StatusBadge colorScheme={colorScheme}>
					{stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : "—"}
				</StatusBadge>
			);
		},
	}),
	columnHelper.accessor("start_date", {
		id: "start_date",
		header: "Started",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const startDate = row.getValue<string>("start_date");
			return startDate ? (
				<div className="text-sm">
					{format(startDate, "MMM d, yyyy")}
				</div>
			) : (
				"—"
			);
		},
	}),
	columnHelper.accessor("offer_date", {
		id: "offer_date",
		header: "Offer Date",
		enableColumnFilter: false,
		enableSorting: true,
		cell: ({ row }) => {
			const offerDate = row.getValue<string>("offer_date");
			return offerDate ? (
				<div className="text-sm">
					{format(offerDate, "MMM d, yyyy")}
				</div>
			) : (
				"—"
			);
		},
	}),
	columnHelper.accessor("commitment_date", {
		id: "commitment_date",
		header: "Committed Date",
		enableColumnFilter: false,
		enableSorting: true,
		cell: ({ row }) => {
			const commitmentDate = row.getValue<string>("commitment_date");
			return commitmentDate ? (
				<div className="text-sm">
					{format(commitmentDate, "MMM d, yyyy")}
				</div>
			) : (
				"—"
			);
		},
	}),
	columnHelper.accessor("last_interaction_at", {
		id: "last_interaction_at",
		header: "Last Interaction",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const lastInteraction = row.getValue<string>("last_interaction_at");
			return lastInteraction ? (
				<div className="text-sm">
					{format(lastInteraction, "MMM d, yyyy")}
				</div>
			) : (
				"—"
			);
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<Application>();

const applicationFilterConfig = [
	universalColumnHelper
		.option("athlete_id")
		.displayName("Athlete")
		.icon(User2Icon)
		.build(),
	universalColumnHelper
		.option("university_id")
		.displayName("University")
		.icon(UniversityIcon)
		.build(),
	universalColumnHelper
		.option("program_id")
		.displayName("Program")
		.icon(TagIcon)
		.build(),
	universalColumnHelper
		.option("stage")
		.displayName("Stage")
		.icon(TagIcon)
		.build(),
	universalColumnHelper
		.date("start_date")
		.displayName("Started")
		.icon(CalendarIcon)
		.build(),
	universalColumnHelper
		.date("last_interaction_at")
		.displayName("Last Interaction")
		.icon(CalendarIcon)
		.build(),
];

function ApplicationsTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [applicationToDelete, setApplicationToDelete] =
		useState<Application | null>(null);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch applications data with faceted data in single optimized call
	const {
		data: applicationsWithFaceted,
		isLoading,
		isError,
		error,
	} = useApplicationsWithFaceted(filters, currentPage, 25, sorting, [
		"athlete_id",
		"university_id",
		"program_id",
		"stage",
	]);

	// Fetch reference data for filter options
	const { data: athletes, isPending: isAthletesPending } = useAthletes();
	const { data: universities, isPending: isUniversitiesPending } =
		useUniversities();
	const { data: programs, isPending: isProgramsPending } = usePrograms();

	// Extract data from combined result
	const applicationsData = applicationsWithFaceted
		? {
				data: applicationsWithFaceted.applications,
				count: applicationsWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const athleteFaceted = applicationsWithFaceted?.facetedData?.athlete_id;
	const universityFaceted = applicationsWithFaceted?.facetedData?.university_id;
	const programFaceted = applicationsWithFaceted?.facetedData?.program_id;
	const stageFaceted = applicationsWithFaceted?.facetedData?.stage;

	// Delete action hook
	const { execute: executeDeleteApplication, isExecuting } = useAction(
		deleteAthleteApplication,
		{
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				setApplicationToDelete(null);
				toast.success("Application deleted successfully");
			},
			onError: (error) => {
				console.error("Failed to delete application:", error);
				toast.error("Failed to delete application. Please try again.");
			},
		},
	);

	const handleDeleteApplication = () => {
		if (applicationToDelete) {
			executeDeleteApplication({ id: applicationToDelete.id });
		}
	};

	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		{
			...universalColumnHelper
				.option("athlete_id")
				.displayName("Athlete")
				.icon(User2Icon)
				.build(),
			options:
				athletes?.map((athlete: any) => ({
					value: athlete.id,
					label: `${athlete.full_name}${athlete.graduation_year ? ` (${athlete.graduation_year})` : ""}`,
				})) || [],
		},
		{
			...universalColumnHelper
				.option("university_id")
				.displayName("University")
				.icon(UniversityIcon)
				.build(),
			options:
				universities?.map((university: any) => ({
					value: university.id,
					label: `${university.name}${university.state ? `, ${university.state}` : ""}`,
				})) || [],
		},
		{
			...universalColumnHelper
				.option("program_id")
				.displayName("Program")
				.icon(TagIcon)
				.build(),
			options:
				programs?.map((program: any) => ({
					value: program.id,
					label: `${program.university?.name || "Unknown"} - ${program.gender ? program.gender.charAt(0).toUpperCase() + program.gender.slice(1) : "Unknown"}'s`,
				})) || [],
		},
		{
			...universalColumnHelper
				.option("stage")
				.displayName("Stage")
				.icon(TagIcon)
				.build(),
			options: stageOptions,
		},
		universalColumnHelper
			.date("start_date")
			.displayName("Started")
			.icon(CalendarIcon)
			.build(),
		universalColumnHelper
			.date("last_interaction_at")
			.displayName("Last Interaction")
			.icon(CalendarIcon)
			.build(),
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (application: Application) => {
				router.push(`/dashboard/athlete-applications/${application.id}`);
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (application: Application) => {
				router.push(`/dashboard/athlete-applications/${application.id}`);
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (application: Application) => {
				setApplicationToDelete(application);
				setIsDeleteDialogOpen(true);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<Application>({
			data: applicationsData?.data || [],
			totalCount: applicationsData?.count || 0,
			columns: applicationTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: {
				athlete_id: athleteFaceted,
				university_id: universityFaceted,
				program_id: programFaceted,
				stage: stageFaceted,
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

	// Check if filter options are still loading
	const isFilterDataPending =
		isAthletesPending || isUniversitiesPending || isProgramsPending;

	if (isError) {
		return (
			<div className="w-full">
				<div className="space-y-2 text-center">
					<p className="text-red-600">
						Error loading applications: {error?.message}
					</p>
					<p className="text-muted-foreground text-sm">
						Please check your database connection and try again.
					</p>
				</div>
			</div>
		);
	}

	const athleteName =
		applicationToDelete?.athlete?.full_name || "Unknown Athlete";
	const universityName =
		applicationToDelete?.university?.name || "Unknown University";

	return (
		<div className="w-full">
			<div className="flex items-center gap-2 pb-4">
				{isFilterDataPending ? (
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
					numCols={applicationTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No applications found matching your filters"
					emptyStateAction={
						<Button size="sm" asChild>
							<Link href="/dashboard/athlete-applications/applications/add">
								<PlusIcon className="h-4 w-4" />
								Add Application
							</Link>
						</Button>
					}
				/>
			)}

			<Dialog.Root
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
					<Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-md transform rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
						<Dialog.Title className="mb-4 font-semibold text-lg">
							Delete Application
						</Dialog.Title>
						<Dialog.Description className="mb-6 text-gray-600 dark:text-gray-300">
							Are you sure you want to delete the application for {athleteName}{" "}
							to {universityName}? This action cannot be undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteApplication}
								disabled={isExecuting}
							>
								{isExecuting ? "Deleting..." : "Delete"}
							</Button>
						</div>
						<Dialog.Close asChild>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-3 right-3 p-1"
							>
								<X className="h-4 w-4" />
							</Button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}

export function AthleteApplicationsDataTable() {
	return (
		<UniversalDataTableWrapper<Application>
			table="athlete_applications"
			columns={applicationTableColumns}
			columnsConfig={applicationFilterConfig}
			urlStateKey="applicationFilters"
		>
			{(state) => <ApplicationsTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
