"use client";

import type { Tables } from "@/utils/supabase/database.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { format } from "date-fns";
import { FileText } from "lucide-react";

type AthleteApplication = Tables<"athlete_applications"> & {
	athletes: {
		id: string;
		full_name: string | null;
		contact_email: string | null;
	} | null;
	programs: {
		id: string;
		gender: string | null;
		team_url: string | null;
	} | null;
};

interface AthleteApplicationsTabProps {
	applications: AthleteApplication[];
	universityId: string;
	onRefresh: () => void;
}

export function AthleteApplicationsTab({
	applications,
}: AthleteApplicationsTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Athlete Applications
				</CardTitle>
			</CardHeader>
			<CardContent>
				{applications.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No applications yet</p>
						<p className="mt-1 text-xs">
							Applications from athletes will appear here once submitted
						</p>
					</div>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Athlete</TableHead>
									<TableHead>Program</TableHead>
									<TableHead>Stage</TableHead>
									<TableHead>Start Date</TableHead>
									<TableHead>Offer Date</TableHead>
									<TableHead>Scholarship</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{applications.map((app) => (
									<TableRow key={app.id}>
										<TableCell className="font-medium">
											<div>
												<div>{app.athletes?.full_name || "Unknown"}</div>
												{app.athletes?.contact_email && (
													<div className="text-muted-foreground text-xs">
														{app.athletes.contact_email}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="capitalize">
											{app.programs?.gender || "-"}
										</TableCell>
										<TableCell className="capitalize">
											{app.stage || "-"}
										</TableCell>
										<TableCell>
											{app.start_date
												? format(
														new Date(app.start_date),
														"MMM dd, yyyy",
													)
												: "-"}
										</TableCell>
										<TableCell>
											{app.offer_date
												? format(new Date(app.offer_date), "MMM dd, yyyy")
												: "-"}
										</TableCell>
										<TableCell>
											{app.scholarship_amount_per_year
												? `$${Number(app.scholarship_amount_per_year).toLocaleString()}`
												: "-"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
