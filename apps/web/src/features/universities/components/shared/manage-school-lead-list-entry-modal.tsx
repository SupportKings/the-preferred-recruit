"use client";

import { type ReactNode, useEffect, useId, useState } from "react";

import type { Tables } from "@/utils/supabase/database.types";

import { LeadListLookup } from "@/components/lookups/lead-list-lookup";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import {
	createSchoolLeadListEntry,
	updateSchoolLeadListEntry,
} from "@/features/school-lead-lists/actions/relations/entries";
import { ENTRY_STATUS_OPTIONS } from "@/features/school-lead-lists/constants/entry-status-options";

import { useQueryClient } from "@tanstack/react-query";
import { ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";

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

interface ManageSchoolLeadListEntryModalProps {
	universityId: string;
	mode: "add" | "edit";
	entry?: LeadListEntry | null;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
}

export function ManageSchoolLeadListEntryModal({
	universityId,
	mode,
	entry,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	onSuccess,
}: ManageSchoolLeadListEntryModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const notesId = useId();

	const [formData, setFormData] = useState({
		lead_list_id: "",
		program_id: null as string | null,
		status: "included",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && entry) {
			setFormData({
				lead_list_id: entry.school_lead_list_id || "",
				program_id: entry.program_id || null,
				status: entry.status || "included",
				internal_notes: entry.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				lead_list_id: "",
				program_id: null,
				status: "included",
				internal_notes: "",
			});
		}
	}, [isEdit, entry]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.lead_list_id) {
			toast.error("Lead list is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && entry) {
				await updateSchoolLeadListEntry(entry.id, {
					program_id: formData.program_id,
					status: formData.status,
					internal_notes: formData.internal_notes,
				});
				toast.success("Entry updated successfully!");
			} else {
				await createSchoolLeadListEntry(formData.lead_list_id, {
					university_id: universityId,
					program_id: formData.program_id,
					status: formData.status,
					internal_notes: formData.internal_notes,
				});
				toast.success("Entry added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: ["universities", "detail", universityId],
			});

			setOpen(false);
			onSuccess?.();
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} entry:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} entry`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined &&
				(children ? (
					<DialogTrigger>{children}</DialogTrigger>
				) : (
					<DialogTrigger>
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							Add Entry
						</Button>
					</DialogTrigger>
				))}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ListPlus className="h-5 w-5" />
						{isEdit ? "Edit Lead List Entry" : "Add to Lead List"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the lead list entry details."
							: "Add this university to an athlete's lead list."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<LeadListLookup
						value={formData.lead_list_id}
						onChange={(value) =>
							setFormData({ ...formData, lead_list_id: value })
						}
						label="Lead List"
						required
						disabled={isEdit}
					/>

					<ProgramLookup
						universityId={universityId}
						value={formData.program_id || ""}
						onChange={(value) =>
							setFormData({ ...formData, program_id: value || null })
						}
						label="Program (Optional)"
						disabled={isEdit}
					/>

					<div className="space-y-2">
						<Label htmlFor="status">Status *</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData({ ...formData, status: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ENTRY_STATUS_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor={notesId}>Internal Notes</Label>
						<Textarea
							id={notesId}
							placeholder="Notes specific to this entry..."
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? isEdit
									? "Updating..."
									: "Adding..."
								: isEdit
									? "Update Entry"
									: "Add Entry"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
