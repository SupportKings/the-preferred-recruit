"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import Link from "next/link";

import type { Tables } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { format } from "date-fns";
import { Edit2, ExternalLink, List, Plus, Trash2 } from "lucide-react";
import { ManageSchoolLeadListEntryModal } from "../shared/manage-school-lead-list-entry-modal";

type LeadListEntry = Tables<"school_lead_list_entries"> & {
	school_lead_lists: {
		id: string;
		name: string | null;
		priority: string | null;
		athlete_id: string | null;
		athlete: {
			id: string;
			full_name: string;
			contact_email: string | null;
			graduation_year: number | null;
		} | null;
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
	setDeleteModal: Dispatch<
		SetStateAction<{
			isOpen: boolean;
			type: string;
			id: string;
			title: string;
		}>
	>;
	onRefresh: () => void;
}

export function LeadListEntriesTab({
	entries,
	universityId,
	setDeleteModal,
	onRefresh,
}: LeadListEntriesTabProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		data: LeadListEntry | null;
	}>({
		isOpen: false,
		data: null,
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<List className="h-5 w-5" />
						Lead List Entries
					</CardTitle>
					<ManageSchoolLeadListEntryModal
						universityId={universityId}
						mode="add"
						onSuccess={onRefresh}
					>
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							Add Entry
						</Button>
					</ManageSchoolLeadListEntryModal>
				</div>
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
									<TableHead>Athlete</TableHead>
									<TableHead>Program</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Added At</TableHead>
									<TableHead>Notes</TableHead>
									<TableHead className="w-[120px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{entries.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell className="font-medium">
											{entry.school_lead_lists ? (
												<div className="flex items-center gap-2">
													<Link
														href={`/dashboard/school-lead-lists/${entry.school_lead_lists.id}`}
														className="text-primary hover:underline"
													>
														{entry.school_lead_lists.name || "Unknown List"}
													</Link>
													<Link
														href={`/dashboard/school-lead-lists/${entry.school_lead_lists.id}`}
														className="text-muted-foreground hover:text-primary"
														title="View lead list details"
													>
														<ExternalLink className="h-3.5 w-3.5" />
													</Link>
												</div>
											) : (
												<span className="text-muted-foreground">
													Unknown List
												</span>
											)}
										</TableCell>
										<TableCell>
											{entry.school_lead_lists?.athlete ? (
												<div className="flex items-center gap-2">
													<Link
														href={`/dashboard/athletes/${entry.school_lead_lists.athlete.id}`}
														className="text-primary hover:underline"
													>
														{entry.school_lead_lists.athlete.full_name}
													</Link>
													<Link
														href={`/dashboard/athletes/${entry.school_lead_lists.athlete.id}`}
														className="text-muted-foreground hover:text-primary"
														title="View athlete profile"
													>
														<ExternalLink className="h-3.5 w-3.5" />
													</Link>
													{entry.school_lead_lists.athlete.graduation_year && (
														<span className="text-muted-foreground text-xs">
															• Class of{" "}
															{entry.school_lead_lists.athlete.graduation_year}
														</span>
													)}
												</div>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell>
											{entry.programs ? (
												<div className="flex items-center gap-2">
													<Link
														href={`/dashboard/programs/${entry.programs.id}`}
														className="text-primary hover:underline"
													>
														{entry.programs.gender === "men"
															? "Men's Program"
															: entry.programs.gender === "women"
																? "Women's Program"
																: "Program"}
													</Link>
													{entry.programs.team_url && (
														<a
															href={entry.programs.team_url}
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
											<StatusBadge>{entry.status}</StatusBadge>
										</TableCell>
										<TableCell>
											{entry.added_at
												? format(new Date(entry.added_at), "MMM dd, yyyy")
												: "-"}
										</TableCell>
										<TableCell className="max-w-[200px] truncate">
											{entry.internal_notes || "-"}
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setEditModal({
															isOpen: true,
															data: entry,
														})
													}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setDeleteModal({
															isOpen: true,
															type: "lead_list_entry",
															id: entry.id,
															title: `Delete entry from ${entry.school_lead_lists?.name || "lead list"}`,
														})
													}
												>
													<Trash2 className="h-4 w-4 text-red-600" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>

			{/* Edit Modal */}
			<ManageSchoolLeadListEntryModal
				universityId={universityId}
				entry={editModal.data}
				mode="edit"
				open={editModal.isOpen}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
				onSuccess={onRefresh}
			/>
		</Card>
	);
}
