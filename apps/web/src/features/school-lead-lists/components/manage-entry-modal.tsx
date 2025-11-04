"use client";

import { type ReactNode, useEffect, useState } from "react";

import { UniversityLookup } from "@/components/lookups/university-lookup";
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
import { schoolLeadListQueries } from "@/features/school-lead-lists/queries/useSchoolLeadLists";

import { useQueryClient } from "@tanstack/react-query";
import { Edit, ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageEntryModalProps {
	leadListId: string;
	mode: "add" | "edit";
	entry?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageEntryModal({
	leadListId,
	mode,
	entry,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageEntryModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		university_id: "",
		program_id: null as string | null,
		status: "included",
		internal_notes: "",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && entry) {
			setFormData({
				university_id: entry.university_id || "",
				program_id: entry.program_id || null,
				status: entry.status || "included",
				internal_notes: entry.internal_notes || "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				university_id: "",
				program_id: null,
				status: "included",
				internal_notes: "",
			});
		}
	}, [isEdit, entry]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.university_id) {
			toast.error("University is required");
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
				await createSchoolLeadListEntry(leadListId, formData);
				toast.success("Entry added successfully!");
			}

			// Invalidate the lead list query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: schoolLeadListQueries.detail(leadListId),
			});

			setOpen(false);
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} entry:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} entry`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							{isEdit ? (
								<>
									<Edit className="h-4 w-4" />
									Edit Entry
								</>
							) : (
								<>
									<Plus className="h-4 w-4" />
									Add Entry
								</>
							)}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ListPlus className="h-5 w-5" />
						{isEdit ? "Edit Entry" : "Add New Entry"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the entry details."
							: "Add a new university/program to this lead list."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* University Field */}
					<UniversityLookup
						value={formData.university_id}
						onChange={(value) => {
							// Clear program when university changes
							setFormData({
								...formData,
								university_id: value,
								program_id: null,
							});
						}}
						label="University"
						required
						disabled={isEdit} // Can't change university in edit mode
					/>

					{/* Program Field */}
					<ProgramLookup
						universityId={formData.university_id}
						value={formData.program_id || ""}
						onChange={(value) =>
							setFormData({ ...formData, program_id: value || null })
						}
						label="Program (Optional)"
						disabled={!formData.university_id} // Disable until university is selected
					/>

					{/* Status Field */}
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

					{/* Internal Notes Field */}
					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
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
