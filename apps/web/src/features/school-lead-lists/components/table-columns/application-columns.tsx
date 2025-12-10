import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { formatLocalDate as format } from "@/lib/date-utils";
import { ExternalLink } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(dateString, "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatCurrency = (amount: number | null) => {
	if (!amount) return "Not set";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
	}).format(amount);
};

export const createApplicationColumns = () => {
	const applicationColumnHelper = createColumnHelper<any>();
	return [
		// Athlete
		applicationColumnHelper.accessor("athlete.full_name", {
			header: "Athlete",
			cell: (info) => {
				const athleteId = info.row.original.athlete_id;
				const athleteName = info.getValue();
				const email = info.row.original.athlete?.contact_email;
				return (
					<div className="flex flex-col">
						<Link
							href={`/dashboard/athletes/${athleteId}`}
							className="flex items-center gap-1 text-primary hover:underline"
						>
							{athleteName || "Unknown Athlete"}
							<ExternalLink className="h-3 w-3" />
						</Link>
						{email && (
							<span className="text-muted-foreground text-xs">{email}</span>
						)}
					</div>
				);
			},
		}),

		// University
		applicationColumnHelper.accessor("university.name", {
			header: "University",
			cell: (info) => {
				const city = info.row.original.university?.city;
				return (
					<div className="flex flex-col">
						<span>{info.getValue() || "Unknown"}</span>
						{city && (
							<span className="text-muted-foreground text-xs">{city}</span>
						)}
					</div>
				);
			},
		}),

		// Program
		applicationColumnHelper.accessor("program.gender", {
			header: "Program",
			cell: (info) => {
				const gender = info.getValue();
				if (!gender) return "Not specified";
				return gender === "mens" ? "Men's" : "Women's";
			},
		}),

		// Stage
		applicationColumnHelper.accessor("stage", {
			header: "Stage",
			cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
		}),

		// Start Date
		applicationColumnHelper.accessor("start_date", {
			header: "Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Offer Date
		applicationColumnHelper.accessor("offer_date", {
			header: "Offer Date",
			cell: (info) => formatDate(info.getValue()),
		}),

		// Scholarship Amount
		applicationColumnHelper.accessor("scholarship_amount_per_year", {
			header: "Scholarship/Year",
			cell: (info) => formatCurrency(info.getValue()),
		}),

		// Scholarship Percent
		applicationColumnHelper.accessor("scholarship_percent", {
			header: "Scholarship %",
			cell: (info) => {
				const percent = info.getValue();
				if (!percent) return "N/A";
				return `${percent}%`;
			},
		}),
	];
};
