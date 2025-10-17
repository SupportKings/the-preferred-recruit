"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
	createLeadListEntry,
	updateLeadListEntry,
} from "@/features/athletes/actions/leadListEntries";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { ListTree, Plus } from "lucide-react";
import { toast } from "sonner";
import { LeadListLookup } from "../lookups/lead-list-lookup";
import { ProgramLookup } from "../lookups/program-lookup";
import { UniversityLookup } from "../lookups/university-lookup";

interface ManageLeadListEntryModalProps {
	athleteId: string;
	mode: "add" | "edit";
	entry?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageLeadListEntryModal({
	athleteId,
	mode,
	entry,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageLeadListEntryModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		lead_list_id: "",
		university_id: "",
		program_id: "",
		status: "pending",
		priority: "",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && entry) {
			setFormData({
				lead_list_id: entry.lead_list_id || "",
				university_id: entry.university_id || "",
				program_id: entry.program_id || "",
				status: entry.status || "pending",
				priority: entry.priority || "",
				internal_notes: entry.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				lead_list_id: "",
				university_id: "",
				program_id: "",
				status: "pending",
				priority: "",
				internal_notes: "",
			});
		}
	}, [isEdit, entry, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.lead_list_id) {
			toast.error("Lead list is required");
			return;
		}

		if (!formData.university_id) {
			toast.error("University is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && entry) {
				await updateLeadListEntry(entry.id, {
					status: formData.status,
					priority: formData.priority,
					internal_notes: formData.internal_notes,
				});
				toast.success("Lead list entry updated successfully!");
			} else {
				await createLeadListEntry({
					lead_list_id: formData.lead_list_id,
					university_id: formData.university_id,
					program_id: formData.program_id || undefined,
					status: formData.status,
					priority: formData.priority || undefined,
					internal_notes: formData.internal_notes,
				});
				toast.success("Lead list entry added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} lead list entry:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} lead list entry`);
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
							<Plus className="h-4 w-4" />
							Add Entry
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ListTree className="h-5 w-5" />
						{isEdit ? "Edit Lead List Entry" : "Add New Lead List Entry"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the lead list entry details."
							: "Add a new university to this lead list."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<LeadListLookup
						athleteId={athleteId}
						value={formData.lead_list_id}
						onChange={(value) =>
							setFormData({ ...formData, lead_list_id: value })
						}
						label="Lead List"
						required
						disabled={isEdit}
					/>

					<UniversityLookup
						value={formData.university_id}
						onChange={(value) =>
							setFormData({ ...formData, university_id: value, program_id: "" })
						}
						label="University"
						required
						disabled={isEdit}
					/>

					<ProgramLookup
						universityId={formData.university_id}
						value={formData.program_id}
						onChange={(value) =>
							setFormData({ ...formData, program_id: value })
						}
						label="Program (Optional)"
						required={false}
						disabled={isEdit || !formData.university_id}
					/>

					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData({ ...formData, status: value })
							}
						>
							<SelectTrigger id="status">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="contacted">Contacted</SelectItem>
								<SelectItem value="replied">Replied</SelectItem>
								<SelectItem value="interested">Interested</SelectItem>
								<SelectItem value="not_interested">Not Interested</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="priority">Priority</Label>
						<Select
							value={formData.priority}
							onValueChange={(value) =>
								setFormData({ ...formData, priority: value })
							}
						>
							<SelectTrigger id="priority">
								<SelectValue placeholder="Select priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="high">High</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="low">Low</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Notes about this entry"
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
