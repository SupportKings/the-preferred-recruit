"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

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
import { format } from "date-fns";
import {
	CalendarIcon,
	EditIcon,
	EyeIcon,
	MailIcon,
	PackageIcon,
	PlusIcon,
	TagIcon,
	TrashIcon,
	UserIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteClient } from "../actions/deleteClient";
import {
	useBillingStatuses,
	useClientsWithFaceted,
	useOnboardingStatuses,
} from "../queries/useClients";
import { ClientDeleteModal } from "./client.delete.modal";

// Type for client row from Supabase with status relations
type ClientRow = Database["public"]["Tables"]["clients"]["Row"] & {
	billing_status?: Database["public"]["Tables"]["billing_status"]["Row"] | null;
	onboarding_status?:
		| Database["public"]["Tables"]["onboarding_status"]["Row"]
		| null;
};

// Create column helper for TanStack table
const columnHelper = createColumnHelper<ClientRow>();

// TanStack table column definitions
const clientTableColumns = [
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
	columnHelper.accessor("client_name", {
		id: "client_name",
		header: "Client Name",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("client_name")}</div>
		),
	}),
	columnHelper.accessor("first_name", {
		id: "first_name",
		header: "Contact Name",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => {
			const firstName = row.getValue<string>("first_name");
			const lastName = row.original.last_name;
			return (
				<div className="text-sm">
					{firstName} {lastName}
				</div>
			);
		},
	}),
	columnHelper.accessor("email", {
		id: "email",
		header: "Email",
		enableColumnFilter: true,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="text-muted-foreground">{row.getValue("email")}</div>
		),
	}),
	columnHelper.display({
		id: "billing_status",
		header: "Billing Status",
		enableColumnFilter: true,
		cell: ({ row }) => {
			const billingStatus = row.original.billing_status;
			return (
				<StatusBadge>{billingStatus?.status_name || "No status"}</StatusBadge>
			);
		},
	}),
	columnHelper.display({
		id: "onboarding_status",
		header: "Onboarding Status",
		enableColumnFilter: true,
		cell: ({ row }) => {
			const onboardingStatus = row.original.onboarding_status;
			return (
				<StatusBadge>
					{onboardingStatus?.status_name || "No status"}
				</StatusBadge>
			);
		},
	}),
];

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<ClientRow>();

const clientFilterConfig = [
	universalColumnHelper
		.text("client_name")
		.displayName("Client Name")
		.icon(UserIcon)
		.build(),
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
		.text("email")
		.displayName("Email")
		.icon(MailIcon)
		.build(),
	universalColumnHelper
		.option("billing_status_id")
		.displayName("Billing Status")
		.icon(TagIcon)
		.build(),
	universalColumnHelper
		.option("onboarding_status_id")
		.displayName("Onboarding Status")
		.icon(TagIcon)
		.build(),
];

function ClientsTableContent({
	filters,
	setFilters,
}: {
	filters: any;
	setFilters: any;
}) {
	const queryClient = useQueryClient();
	const [clientToDelete, setClientToDelete] = useState<ClientRow | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState<any[]>([]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0);
	}, [filters]);

	const { execute: executeDelete } = useAction(deleteClient, {
		onSuccess: () => {
			// Invalidate and refetch the clients data
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			setClientToDelete(null);
		},
		onError: ({ error }) => {
			console.error("Error deleting client:", error);
		},
	});

	// Fetch clients data with faceted data in single optimized call
	const {
		data: clientsWithFaceted,
		isLoading,
		isError,
		error,
	} = useClientsWithFaceted(
		filters,
		currentPage,
		25,
		sorting,
		["billing_status_id", "onboarding_status_id"], // columns to get faceted data for
	);

	// Fetch statuses for filter options using server-side hooks
	const { data: billingStatuses, isPending: isBillingStatusesPending } =
		useBillingStatuses();
	const { data: onboardingStatuses, isPending: isOnboardingStatusesPending } =
		useOnboardingStatuses();

	// Extract data from combined result
	const clientsData = clientsWithFaceted
		? {
				data: clientsWithFaceted.clients,
				count: clientsWithFaceted.totalCount,
			}
		: { data: [], count: 0 };

	const billingStatusFaceted =
		clientsWithFaceted?.facetedData?.billing_status_id;
	const onboardingStatusFaceted =
		clientsWithFaceted?.facetedData?.onboarding_status_id;

	// Create dynamic filter config with proper types based on database schema
	const dynamicFilterConfig = [
		universalColumnHelper
			.text("client_name")
			.displayName("Client Name")
			.icon(UserIcon)
			.build(),
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
			.text("email")
			.displayName("Email")
			.icon(MailIcon)
			.build(),
		{
			...universalColumnHelper
				.option("billing_status_id")
				.displayName("Billing Status")
				.icon(TagIcon)
				.build(),
			options:
				billingStatuses?.map((status: any) => ({
					value: status.id,
					label: status.status_name,
				})) || [],
		},
		{
			...universalColumnHelper
				.option("onboarding_status_id")
				.displayName("Onboarding Status")
				.icon(TagIcon)
				.build(),
			options:
				onboardingStatuses?.map((status: any) => ({
					value: status.id,
					label: status.status_name,
				})) || [],
		},
	];

	const rowActions = [
		{
			label: "View Details",
			icon: EyeIcon,
			onClick: (client: ClientRow) => {
				window.location.href = `/dashboard/clients/${client.id}`;
			},
		},
		{
			label: "Edit",
			icon: EditIcon,
			onClick: (client: ClientRow) => {
				window.location.href = `/dashboard/clients/${client.id}/edit`;
			},
		},
		{
			label: "Delete",
			icon: TrashIcon,
			variant: "destructive" as const,
			onClick: (client: ClientRow) => {
				setClientToDelete(client);
			},
		},
	];

	const { table, filterColumns, filterState, actions, strategy, totalCount } =
		useUniversalTable<ClientRow>({
			data: clientsData?.data || [],
			totalCount: clientsData?.count || 0,
			columns: clientTableColumns,
			columnsConfig: dynamicFilterConfig,
			filters,
			onFiltersChange: setFilters,
			faceted: {
				billing_status_id: billingStatusFaceted,
				onboarding_status_id: onboardingStatusFaceted,
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
		isBillingStatusesPending || isOnboardingStatusesPending;

	if (isError) {
		return (
			<div className="w-full">
				<div className="space-y-2 text-center">
					<p className="text-red-600">
						Error loading clients: {error?.message}
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
					numCols={clientTableColumns.length}
					numRows={10}
				/>
			) : (
				<UniversalDataTable
					table={table}
					actions={actions}
					totalCount={totalCount}
					rowActions={rowActions}
					emptyStateMessage="No clients found matching your filters"
					emptyStateAction={
						<Button size="sm" asChild>
							<Link href="/dashboard/clients/add">
								<PlusIcon className="h-4 w-4" />
								Add Client
							</Link>
						</Button>
					}
				/>
			)}

			{clientToDelete && (
				<ClientDeleteModal
					client={clientToDelete}
					open={!!clientToDelete}
					onOpenChange={(open) => !open && setClientToDelete(null)}
					onConfirm={async () => {
						const clientId = clientToDelete.id;
						const clientName = `${clientToDelete.first_name} ${clientToDelete.last_name}`;

						if (!clientId) {
							toast.error("Client ID is missing");
							throw new Error("Client ID is missing");
						}

						try {
							await deleteClient({ id: clientId });

							// Refresh the table after successful deletion
							queryClient.invalidateQueries({ queryKey: ["clients"] });
							setClientToDelete(null);

							// Show success toast
							toast.success(`${clientName} has been deleted successfully`);
						} catch (error) {
							// Show error toast
							toast.error(`Failed to delete ${clientName}. Please try again.`);
							throw error;
						}
					}}
				/>
			)}
		</div>
	);
}

export function ClientsDataTable() {
	return (
		<UniversalDataTableWrapper<ClientRow>
			table="clients"
			columns={clientTableColumns}
			columnsConfig={clientFilterConfig}
			urlStateKey="clientFilters"
		>
			{(state) => <ClientsTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
