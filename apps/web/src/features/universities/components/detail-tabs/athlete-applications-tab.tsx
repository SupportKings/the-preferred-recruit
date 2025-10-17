"use client";

import Link from "next/link";

import type { Tables } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { updateAthleteApplication } from "@/features/athlete-applications/actions/updateAthleteApplication";

import { format } from "date-fns";
import { ExternalLink, Eye, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { InlineStageCell } from "./inline-stage-cell";

type AthleteApplication = Tables<"athlete_applications"> & {
	athletes: {
		id: string;
		full_name: string | null;
		contact_email: string | null;
		athlete_net_url: string | null;
		instagram_handle: string | null;
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
	universityId,
	onRefresh,
}: AthleteApplicationsTabProps) {
	const handleInlineEdit = async (
		applicationId: string,
		field: string,
		value: string | null,
	) => {
		try {
			const result = await updateAthleteApplication({
				id: applicationId,
				[field]: value,
			} as Parameters<typeof updateAthleteApplication>[0]);

			if (result?.validationErrors) {
				toast.error("Failed to update application");
				return;
			}

			if (result?.data?.success) {
				toast.success("Application updated successfully");
				onRefresh();
			}
		} catch (error) {
			console.error("Error updating application:", error);
			toast.error("Failed to update application");
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Athlete Applications
					</CardTitle>
					<Button variant="outline" size="sm" className="gap-2" asChild>
						<Link
							href={`/dashboard/athlete-applications/new?university_id=${universityId}`}
						>
							<Plus className="h-4 w-4" />
							Add Application
						</Link>
					</Button>
				</div>
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
									<TableHead>Commitment Date</TableHead>
									<TableHead>Scholarship/Year</TableHead>
									<TableHead>Scholarship %</TableHead>
									<TableHead>Internal Notes</TableHead>
									<TableHead className="w-[80px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{applications.map((app) => (
									<TableRow key={app.id}>
										<TableCell className="font-medium">
											{app.athletes?.full_name ? (
												<div>
													<div className="flex items-center gap-2">
														<Link
															href={`/dashboard/athletes/${app.athletes.id}`}
															className="text-primary hover:underline"
														>
															{app.athletes.full_name}
														</Link>
														{app.athletes.athlete_net_url && (
															<a
																href={app.athletes.athlete_net_url}
																target="_blank"
																rel="noopener noreferrer"
																className="text-muted-foreground hover:text-primary"
																title="AthleteNet Profile"
															>
																<ExternalLink className="h-3.5 w-3.5" />
															</a>
														)}
													</div>
													{app.athletes.contact_email && (
														<div className="text-muted-foreground text-xs">
															{app.athletes.contact_email}
														</div>
													)}
												</div>
											) : (
												<span className="text-muted-foreground">Unknown</span>
											)}
										</TableCell>
										<TableCell>
											{app.programs ? (
												<div className="flex items-center gap-2">
													<Link
														href={`/dashboard/programs/${app.programs.id}`}
														className="text-primary hover:underline"
													>
														{app.programs.gender === "men"
															? "Men's Program"
															: app.programs.gender === "women"
																? "Women's Program"
																: "Program"}
													</Link>
													{app.programs.team_url && (
														<a
															href={app.programs.team_url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-muted-foreground hover:text-primary"
															title="Visit team website"
														>
															<ExternalLink className="h-3.5 w-3.5" />
														</a>
													)}
												</div>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell>
											<InlineStageCell
												value={app.stage}
												onSave={(value) =>
													handleInlineEdit(app.id, "stage", value)
												}
											/>
										</TableCell>
										<TableCell>
											{app.start_date
												? format(new Date(app.start_date), "MMM dd, yyyy")
												: "-"}
										</TableCell>
										<TableCell>
											{app.offer_date
												? format(new Date(app.offer_date), "MMM dd, yyyy")
												: "-"}
										</TableCell>
										<TableCell>
											{app.commitment_date
												? format(new Date(app.commitment_date), "MMM dd, yyyy")
												: "-"}
										</TableCell>
										<TableCell>
											{app.scholarship_amount_per_year
												? `$${Number(app.scholarship_amount_per_year).toLocaleString()}`
												: "-"}
										</TableCell>
										<TableCell>
											{app.scholarship_percent
												? `${app.scholarship_percent}%`
												: "-"}
										</TableCell>
										<TableCell>
											<div className="max-w-[200px] truncate text-sm">
												{app.internal_notes || "-"}
											</div>
										</TableCell>
										<TableCell>
											<Button variant="ghost" size="sm" asChild>
												<Link
													href={`/dashboard/athlete-applications/${app.id}`}
												>
													<Eye className="h-4 w-4" />
												</Link>
											</Button>
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
