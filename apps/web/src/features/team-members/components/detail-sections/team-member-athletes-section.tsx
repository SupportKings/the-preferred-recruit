import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	createColumnHelper,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Users } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatCurrency = (value: number | null) => {
	if (!value) return "$0";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

interface AthleteRow {
	id: string;
	full_name: string | null;
	contact_email: string | null;
	last_sales_call_at: string | null;
	sales_call_note: string | null;
	initial_contract_amount_usd: number | null;
	initial_cash_collected_usd: number | null;
	sales_setter_id: string | null;
	sales_closer_id: string | null;
}

interface TeamMemberAthletesSectionProps {
	teamMemberId: string;
	athletes: AthleteRow[];
}

export function TeamMemberAthletesSection({
	teamMemberId,
	athletes,
}: TeamMemberAthletesSectionProps) {
	// Create column helper
	const athleteColumnHelper = createColumnHelper<AthleteRow>();

	const columns = [
		athleteColumnHelper.accessor("full_name", {
			header: "Athlete",
			cell: (info) => info.getValue() || "Unknown",
		}),
		athleteColumnHelper.accessor("contact_email", {
			header: "Email",
			cell: (info) => info.getValue() || "No email",
		}),
		athleteColumnHelper.accessor("sales_setter_id", {
			header: "Role",
			cell: (info) => {
				const row = info.row.original;
				const isSetter = row.sales_setter_id === teamMemberId;
				const isCloser = row.sales_closer_id === teamMemberId;

				if (isSetter && isCloser) return "Setter & Closer";
				if (isSetter) return "Sales Setter";
				if (isCloser) return "Sales Closer";
				return "Unknown";
			},
		}),
		athleteColumnHelper.accessor("last_sales_call_at", {
			header: "Last Sales Call",
			cell: (info) => formatDate(info.getValue()),
		}),
		athleteColumnHelper.accessor("sales_call_note", {
			header: "Sales Call Note",
			cell: (info) => {
				const note = info.getValue();
				if (!note) return "No notes";
				return note.length > 50 ? `${note.substring(0, 50)}...` : note;
			},
		}),
		athleteColumnHelper.accessor("initial_contract_amount_usd", {
			header: "Initial Contract",
			cell: (info) => formatCurrency(info.getValue()),
		}),
		athleteColumnHelper.accessor("initial_cash_collected_usd", {
			header: "Cash Collected",
			cell: (info) => formatCurrency(info.getValue()),
		}),
	];

	const athletesTable = useReactTable({
		data: athletes || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!athletes || athletes.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Athletes (Sales Setter/Closer)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No athletes assigned yet</p>
						<p className="mt-1 text-xs">
							Athletes will appear here when this team member is assigned as a
							sales setter or closer
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Athletes (Sales Setter/Closer)
					</CardTitle>
					<span className="text-muted-foreground text-sm">
						{athletes.length} {athletes.length === 1 ? "athlete" : "athletes"}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={athletesTable}
					emptyStateMessage="No athletes found for this team member"
				/>
			</CardContent>
		</Card>
	);
}
