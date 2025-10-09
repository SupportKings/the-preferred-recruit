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
import { Send } from "lucide-react";

type CampaignLead = Tables<"campaign_leads"> & {
	campaigns: {
		id: string;
		name: string | null;
		type: string | null;
	} | null;
	programs: {
		id: string;
		gender: string | null;
		team_url: string | null;
	} | null;
	university_jobs: {
		id: string;
		job_title: string | null;
		work_email: string | null;
	} | null;
};

interface CampaignLeadsTabProps {
	leads: CampaignLead[];
	universityId: string;
	onRefresh: () => void;
}

export function CampaignLeadsTab({ leads }: CampaignLeadsTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Send className="h-5 w-5" />
					Campaign Leads
				</CardTitle>
			</CardHeader>
			<CardContent>
				{leads.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Send className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No campaign leads yet</p>
						<p className="mt-1 text-xs">
							This university hasn't been targeted in any campaigns yet
						</p>
					</div>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Campaign</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Program</TableHead>
									<TableHead>Coach/Job</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>First Reply</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{leads.map((lead) => (
									<TableRow key={lead.id}>
										<TableCell className="font-medium">
											{lead.campaigns?.name || "Unknown Campaign"}
										</TableCell>
										<TableCell className="capitalize">
											{lead.campaigns?.type || "-"}
										</TableCell>
										<TableCell className="capitalize">
											{lead.programs?.gender || "-"}
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<div>{lead.university_jobs?.job_title || "-"}</div>
												{lead.university_jobs?.work_email && (
													<div className="text-muted-foreground text-xs">
														{lead.university_jobs.work_email}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="capitalize">
											{lead.status || "-"}
										</TableCell>
										<TableCell>
											{lead.first_reply_at
												? format(new Date(lead.first_reply_at), "MMM dd, yyyy")
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
