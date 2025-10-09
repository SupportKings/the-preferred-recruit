"use client";

import { useState } from "react";

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

import { deleteProgramAction } from "@/features/programs/actions/deleteProgram";

import { Edit2, ExternalLink, Eye, Layers, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ManageProgramModal } from "../shared/manage-program-modal";

interface Program extends Tables<"programs"> {}

interface ProgramsTabProps {
	programs: Program[];
	universityId: string;
	onRefresh: () => void;
}

export function ProgramsTab({
	programs,
	universityId,
	onRefresh,
}: ProgramsTabProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: Program | null;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	// Delete program action
	const { execute: executeDelete, isExecuting: isDeleting } = useAction(
		deleteProgramAction,
		{
			onSuccess: () => {
				toast.success("Program deleted successfully");
				onRefresh();
			},
			onError: (err) => {
				console.error("Error deleting program:", err);
				toast.error(
					err.error.serverError ||
						"Failed to delete program. Please try again.",
				);
			},
		},
	);

	const handleDelete = async (programId: string) => {
		if (!confirm("Are you sure you want to delete this program?")) return;
		executeDelete({ id: programId });
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Layers className="h-5 w-5" />
						Programs
					</CardTitle>
					<ManageProgramModal
						universityId={universityId}
						mode="add"
						onSuccess={onRefresh}
					/>
				</div>
			</CardHeader>
			<CardContent>
				{programs.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Layers className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No programs yet</p>
						<p className="mt-1 text-xs">
							Programs will appear here once added to this university
						</p>
					</div>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Gender</TableHead>
									<TableHead>Team URL</TableHead>
									<TableHead>Instagram</TableHead>
									<TableHead>Twitter/X</TableHead>
									<TableHead>Notes</TableHead>
									<TableHead className="w-[120px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{programs.map((program) => (
									<TableRow key={program.id}>
										<TableCell className="font-medium capitalize">
											{program.gender}
										</TableCell>
										<TableCell>
											{program.team_url ? (
												<a
													href={program.team_url}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-blue-600 hover:underline"
												>
													<ExternalLink className="h-3 w-3" />
													Link
												</a>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell>
											{program.team_instagram ? (
												<a
													href={program.team_instagram}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-blue-600 hover:underline"
												>
													<ExternalLink className="h-3 w-3" />
													Link
												</a>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell>
											{program.team_twitter ? (
												<a
													href={program.team_twitter}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-blue-600 hover:underline"
												>
													<ExternalLink className="h-3 w-3" />
													Link
												</a>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell className="max-w-[200px] truncate">
											{program.internal_notes || "-"}
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												<Link href={`/dashboard/programs/${program.id}`}>
													<Button variant="ghost" size="sm">
														<Eye className="h-4 w-4" />
													</Button>
												</Link>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setEditModal({
															isOpen: true,
															type: "program",
															data: program,
														})
													}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(program.id)}
													disabled={isDeleting}
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
			<ManageProgramModal
				universityId={universityId}
				program={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "program"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
				onSuccess={onRefresh}
			/>
		</Card>
	);
}
