"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
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
	BriefcaseIcon,
	ClockIcon,
	EditIcon,
	EyeIcon,
	PlusIcon,
	TrashIcon,
	UserIcon,
} from "lucide-react";
import { useTeamMembersWithFaceted, useUsers } from "../queries/useTeamMembers";
import { getTeamMemberName } from "../utils/team-member-helpers";

// Type for team member row from Supabase with user relation
type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"] & {
	user?: { id: string; email: string } | null;
};

// Create column helper for TanStack table
const columnHelper = createColumnHelper<TeamMemberRow>();

// TanStack table column definitions
const teamMemberTableColumns = [
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
		id: "name",
		header: "Name",
		enableColumnFilter: true,
		enableSorting: false,
		cell: ({ row }) => {
			const name = getTeamMemberName(row.original);
			return <div className="font-medium">{name}</div>;
		},
	}),
	columnHelper.accessor("job_title", {
		id: "job_title",
		header: "Job Title",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-sm">{row.getValue("job_title") || "N/A"}</div>
		),
	}),
	columnHelper.accessor("timezone", {
		id: "timezone",
		header: "Timezone",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-muted-foreground">
				{row.getValue("timezone") || "N/A"}
			</div>
		),
	}),
	columnHelper.display({
		id: "user_id",
		header: "Linked User",
		enableColumnFilter: true,
		cell: ({ row }) => {
			const user = row.original.user;
			return <div className="text-sm">{user?.email || "No linked user"}</div>;
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<TeamMemberRow>();

const teamMemberFilterConfig = [
	universalColumnHelper
		.text("first_name")
		.displayName("First Name")
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.text("last_name")
		.displayName("Last Name")
		.icon(UserIcon)
		.build(),
	universalColumnHelper
		.text("job_title")
		.displayName("Job Title")
		.icon(BriefcaseIcon)
		.build(),
	universalColumnHelper
		.text("timezone")
		.displayName("Timezone")
		.icon(ClockIcon)
		.build(),
	universalColumnHelper
		.option("user_id")
		.displayName("Linked User")
		.icon(UserIcon)
		.build(),
];

function TeamMembersTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const router = useRouter();
	const _queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, []);

	// Fetch team members data with faceted data in single optimized call
	const {
		data: teamMembersWithFaceted,
		isLoading,
		isError,
		error,
	} = useTeamMembersWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		["user_id"], // columns to get faceted data for
	);

	// Fetch users for filter options using server-side hooks
	const { data: users, isPending: isUsersPending } = useUsers();

	// Extract data from combined result
	const teamMembersData = teamMembersWithFaceted
		? {
				data: teamMembersWithFaceted.teamMembers,
				count: teamMembersWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const userFaceted = teamMembersWithFaceted?.facetedData?.user_id;

	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		universalColumnHelper
			.text("first_name")
			.displayName("First Name")
			.icon(UserIcon)
			.build(),
		universalColumnHelper
			.text("last_name")
			.displayName("Last Name")
			.icon(UserIcon)
			.build(),
		universalColumnHelper
			.text("job_title")
			.displayName("Job Title")
			.icon(BriefcaseIcon)
			.build(),
		universalColumnHelper
			.text("timezone")
			.displayName("Timezone")
			.icon(ClockIcon)
			.build(),
		{
			...universalColumnHelper
				.option("user_id")
				.displayName("Linked User")
				.icon(UserIcon)
				.build(),
			options:
				users?.map((user: any) => ({
					value: user.id,
					label: user.email,
				})) || [],
		},
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (teamMember: TeamMemberRow) => {
				router.push(`/dashboard/team-members/${teamMember.id}`);
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (teamMember: TeamMemberRow) => {
				router.push(`/dashboard/team-members/${teamMember.id}`);
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (teamMember: TeamMemberRow) => {
				router.push(`/dashboard/team-members/${teamMember.id}`);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<TeamMemberRow>({
			data: teamMembersData?.data || [],
			totalCount: teamMembersData?.count || 0,
			columns: teamMemberTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: {
				user_id: userFaceted,
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
	const isFilterDataPending = isUsersPending;

	if (isError) {
		return (
			<div className="w-full">
				<div className="space-y-2 text-center">
					<p className="text-red-600">
						Error loading team members: {error?.message}
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
					numCols={teamMemberTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No team members found matching your filters"
					emptyStateAction={
						<Button size="sm" asChild>
							<Link href="#">
								<PlusIcon className="h-4 w-4" />
								Add Team Member
							</Link>
						</Button>
					}
				/>
			)}
		</div>
	);
}

export function TeamMembersDataTable() {
	return (
		<UniversalDataTableWrapper<TeamMemberRow>
			table="team-members"
			columns={teamMemberTableColumns}
			columnsConfig={teamMemberFilterConfig}
			urlStateKey="teamMemberFilters"
		>
			{(state) => <TeamMembersTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
