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
import { List } from "lucide-react";

type LeadListEntry = Tables<"school_lead_list_entries"> & {
	school_lead_lists: {
		id: string;
		name: string | null;
		priority: string | null;
	} | null;
	programs: {
		id: string;
		gender: string | null;
		team_url: string | null;
	} | null;
};

interface LeadListEntriesTabProps {
	entries: LeadListEntry[];
	universityId: string;
	onRefresh: () => void;
}

export function LeadListEntriesTab({ entries }: LeadListEntriesTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<List className="h-5 w-5" />
					Lead List Entries
				</CardTitle>
			</CardHeader>
			<CardContent>
				{entries.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<List className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No lead list entries yet</p>
						<p className="mt-1 text-xs">
							This university hasn't been added to any athlete lead lists yet
						</p>
					</div>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Lead List</TableHead>
									<TableHead>Priority</TableHead>
									<TableHead>Program</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Added At</TableHead>
									<TableHead>Notes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{entries.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell className="font-medium">
											{entry.school_lead_lists?.name || "Unknown List"}
										</TableCell>
										<TableCell className="capitalize">
											{entry.school_lead_lists?.priority || "-"}
										</TableCell>
										<TableCell className="capitalize">
											{entry.programs?.gender || "-"}
										</TableCell>
										<TableCell className="capitalize">
											{entry.status || "-"}
										</TableCell>
										<TableCell>
											{entry.added_at
												? format(new Date(entry.added_at), "MMM dd, yyyy")
												: "-"}
										</TableCell>
										<TableCell className="max-w-[200px] truncate">
											{entry.internal_notes || "-"}
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
