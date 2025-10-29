"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Database } from "@/utils/supabase/database.types";

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

import { useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import {
	Building2Icon,
	DollarSignIcon,
	EditIcon,
	EyeIcon,
	HashIcon,
	MailIcon,
	MapPinIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { deleteUniversity } from "../actions/deleteUniversity";
import { useUniversitiesWithFaceted } from "../queries/useUniversities";
import { DeleteUniversityModal } from "./modals/delete-university-modal";

type UniversityRow = Database["public"]["Tables"]["universities"]["Row"] & {
	current_conference?: string | null;
	current_division?: string | null;
};

const columnHelper = createColumnHelper<UniversityRow>();

const universityTableColumns = [
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
	columnHelper.accessor("name", {
		id: "name",
		header: "Name",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<Link
				href={`/dashboard/universities/${row.original.id}`}
				className="font-medium"
			>
				{row.getValue("name")}
			</Link>
		),
	}),
	columnHelper.accessor("city", {
		id: "city",
		header: "City",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => <div className="text-sm">{row.getValue("city")}</div>,
	}),
	columnHelper.accessor("state", {
		id: "state",
		header: "State",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => <div className="text-sm">{row.getValue("state")}</div>,
	}),
	columnHelper.accessor("current_conference", {
		id: "current_conference",
		header: "Conference",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const conference = row.getValue<string>("current_conference");
			return <div className="text-sm">{conference || "N/A"}</div>;
		},
	}),
	columnHelper.accessor("current_division", {
		id: "current_division",
		header: "Division",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const division = row.getValue<string>("current_division");
			return <div className="text-sm">{division || "N/A"}</div>;
		},
	}),
	columnHelper.accessor("type_public_private", {
		id: "type_public_private",
		header: "Type",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const type = row.getValue<string>("type_public_private");
			return <StatusBadge>{type || "N/A"}</StatusBadge>;
		},
	}),
	columnHelper.accessor("total_yearly_cost", {
		id: "total_yearly_cost",
		header: "Annual Cost",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const cost = row.getValue<number>("total_yearly_cost");
			return (
				<div className="text-sm">
					{cost ? `$${cost.toLocaleString()}` : "N/A"}
				</div>
			);
		},
	}),
	columnHelper.accessor("undergraduate_enrollment", {
		id: "undergraduate_enrollment",
		header: "Enrollment",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const enrollment = row.getValue<number>("undergraduate_enrollment");
			return (
				<div className="text-sm">
					{enrollment ? enrollment.toLocaleString() : "N/A"}
				</div>
			);
		},
	}),
	columnHelper.accessor("email_blocked", {
		id: "email_blocked",
		header: "Email Blocked",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const blocked = row.getValue<boolean>("email_blocked");
			return (
				<StatusBadge colorScheme={blocked ? "red" : "green"}>
					{blocked ? "Blocked" : "Active"}
				</StatusBadge>
			);
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<UniversityRow>();

const universityFilterConfig = [
	universalColumnHelper
		.text("name")
		.displayName("Name")
		.icon(Building2Icon)
		.build(),
	universalColumnHelper
		.text("city")
		.displayName("City")
		.icon(MapPinIcon)
		.build(),
	universalColumnHelper
		.text("state")
		.displayName("State")
		.icon(MapPinIcon)
		.build(),
	universalColumnHelper
		.option("current_conference")
		.displayName("Conference")
		.icon(Building2Icon)
		.build(),
	universalColumnHelper
		.option("current_division")
		.displayName("Division")
		.icon(Building2Icon)
		.build(),
	universalColumnHelper
		.option("type_public_private")
		.displayName("Type")
		.icon(Building2Icon)
		.build(),
	universalColumnHelper
		.number("total_yearly_cost")
		.displayName("Annual Cost")
		.icon(DollarSignIcon)
		.build(),
	universalColumnHelper
		.number("undergraduate_enrollment")
		.displayName("Enrollment")
		.icon(HashIcon)
		.build(),
	universalColumnHelper
		.option("email_blocked")
		.displayName("Email Blocked")
		.icon(MailIcon)
		.build(),
];

function UniversitiesTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [universityToDelete, setUniversityToDelete] =
		useState<UniversityRow | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	// Fetch universities data with faceted data in single optimized call
	const {
		data: universitiesWithFaceted,
		isLoading,
		isError,
		error,
	} = useUniversitiesWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		[
			"state",
			"current_conference",
			"current_division",
			"type_public_private",
			"email_blocked",
		], // columns to get faceted data for
	);

	// Extract data from combined result
	const universitiesData = universitiesWithFaceted
		? {
				data: universitiesWithFaceted.universities,
				count: universitiesWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const stateFaceted = universitiesWithFaceted?.facetedData?.state;
	const conferenceFaceted =
		universitiesWithFaceted?.facetedData?.current_conference;
	const divisionFaceted =
		universitiesWithFaceted?.facetedData?.current_division;
	const typeFaceted = universitiesWithFaceted?.facetedData?.type_public_private;
	const emailBlockedFaceted =
		universitiesWithFaceted?.facetedData?.email_blocked;

	// Build dynamic options from faceted data
	const stateOptions = stateFaceted
		? Array.from(stateFaceted.keys()).map((state) => ({
				value: state,
				label: state,
			}))
		: [];

	const conferenceOptions = conferenceFaceted
		? Array.from(conferenceFaceted.keys())
				.filter((conf) => conf !== "null")
				.map((conference) => ({
					value: conference,
					label: conference,
				}))
		: [];

	const divisionOptions = divisionFaceted
		? Array.from(divisionFaceted.keys())
				.filter((div) => div !== "null")
				.map((division) => ({
					value: division,
					label: division,
				}))
		: [];

	const typeOptions = typeFaceted
		? Array.from(typeFaceted.keys()).map((type) => ({
				value: type,
				label: type,
			}))
		: [];

	const emailBlockedOptions = [
		{ value: "true", label: "Blocked" },
		{ value: "false", label: "Active" },
	];

	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		universalColumnHelper
			.text("name")
			.displayName("Name")
			.icon(Building2Icon)
			.build(),
		universalColumnHelper
			.text("city")
			.displayName("City")
			.icon(MapPinIcon)
			.build(),
		{
			...universalColumnHelper
				.option("state")
				.displayName("State")
				.icon(MapPinIcon)
				.build(),
			options: stateOptions,
		},
		{
			...universalColumnHelper
				.option("current_conference")
				.displayName("Conference")
				.icon(Building2Icon)
				.build(),
			options: conferenceOptions,
		},
		{
			...universalColumnHelper
				.option("current_division")
				.displayName("Division")
				.icon(Building2Icon)
				.build(),
			options: divisionOptions,
		},
		{
			...universalColumnHelper
				.option("type_public_private")
				.displayName("Type")
				.icon(Building2Icon)
				.build(),
			options: typeOptions,
		},
		universalColumnHelper
			.number("total_yearly_cost")
			.displayName("Annual Cost")
			.icon(DollarSignIcon)
			.build(),
		universalColumnHelper
			.number("undergraduate_enrollment")
			.displayName("Enrollment")
			.icon(HashIcon)
			.build(),
		{
			...universalColumnHelper
				.option("email_blocked")
				.displayName("Email Blocked")
				.icon(MailIcon)
				.build(),
			options: emailBlockedOptions,
		},
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (university: UniversityRow) => {
				router.push(`/dashboard/universities/${university.id}`);
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (university: UniversityRow) => {
				router.push(`/dashboard/universities/${university.id}`);
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (university: UniversityRow) => {
				setUniversityToDelete(university);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<UniversityRow>({
			data: universitiesData?.data || [],
			totalCount: universitiesData?.count || 0,
			columns: universityTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: {
				state: stateFaceted,
				current_conference: conferenceFaceted,
				current_division: divisionFaceted,
				type_public_private: typeFaceted,
				email_blocked: emailBlockedFaceted,
			},
			enableSelection: true,
			pageSize: 25,
			pageIndex: currentPage,
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
						Error loading universities: {error?.message}
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
					numCols={universityTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No universities found matching your filters"
					emptyStateAction={
						<Button asChild>
							<Link
								href="/dashboard/universities/add"
								className="flex items-center"
							>
								<PlusIcon className="h-4 w-4" />
								Add University
							</Link>
						</Button>
					}
				/>
			)}

			{universityToDelete && (
				<DeleteUniversityModal
					isOpen={!!universityToDelete}
					onOpenChange={(open) => !open && setUniversityToDelete(null)}
					universityName={universityToDelete.name || undefined}
					onConfirm={async () => {
						const universityId = universityToDelete.id;
						const universityName = universityToDelete.name;

						if (!universityId) {
							toast.error("University ID is missing");
							throw new Error("University ID is missing");
						}

						try {
							await deleteUniversity({ id: universityId });

							// Refresh the table after successful deletion
							queryClient.invalidateQueries({ queryKey: ["universities"] });
							setUniversityToDelete(null);

							// Show success toast
							toast.success(`${universityName} has been deleted successfully`);
						} catch (error) {
							// Show error toast
							toast.error(
								`Failed to delete ${universityName}. Please try again.`,
							);
							throw error;
						}
					}}
				/>
			)}
		</div>
	);
}

export function UniversitiesDataTable() {
	return (
		<UniversalDataTableWrapper<UniversityRow>
			table="universities"
			columns={universityTableColumns}
			columnsConfig={universityFilterConfig}
			urlStateKey="universityFilters"
		>
			{(state) => <UniversitiesTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
