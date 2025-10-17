"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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

import { EventLookup } from "@/features/athletes/components/lookups/event-lookup";
import { universityJobQueries } from "@/features/university-jobs/queries/useUniversityJobs";

import { useQueryClient } from "@tanstack/react-query";
import { Edit, ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";
import {
	createCoachResponsibility,
	updateCoachResponsibility,
} from "../actions/relations/responsibilities";

interface ManageResponsibilityModalProps {
	universityJobId: string;
	mode: "add" | "edit";
	responsibility?: unknown;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageResponsibilityModal({
	universityJobId,
	mode,
	responsibility,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageResponsibilityModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		event_group: null as string | null,
		event_id: null as string | null,
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && responsibility) {
			const resp = responsibility as {
				event_group?: string | null;
				events?: { id: string } | null;
				internal_notes?: string | null;
			};
			setFormData({
				event_group: resp.event_group || null,
				event_id: resp.events?.id || null,
				internal_notes: resp.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				event_group: null,
				event_id: null,
				internal_notes: "",
			});
		}
	}, [isEdit, responsibility, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			if (isEdit && responsibility) {
				const resp = responsibility as { id: string };
				await updateCoachResponsibility(resp.id, formData);
				toast.success("Responsibility updated successfully!");
			} else {
				await createCoachResponsibility(universityJobId, formData);
				toast.success("Responsibility added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: universityJobQueries.detail(universityJobId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} responsibility:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} responsibility`);
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
								<Edit className="h-4 w-4" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							{isEdit ? "Edit Responsibility" : "Add Responsibility"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ListChecks className="h-5 w-5" />
						{isEdit ? "Edit Responsibility" : "Add New Responsibility"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the responsibility details."
							: "Add a new coaching responsibility."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="event_group">Event Group</Label>
						<Select
							value={formData.event_group || "none"}
							onValueChange={(value) =>
								setFormData({
									...formData,
									event_group: value === "none" ? null : value,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select event group" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" disabled>
									Select event group
								</SelectItem>
								<SelectItem value="sprints">Sprints</SelectItem>
								<SelectItem value="hurdles">Hurdles</SelectItem>
								<SelectItem value="distance">Distance</SelectItem>
								<SelectItem value="jumps">Jumps</SelectItem>
								<SelectItem value="throws">Throws</SelectItem>
								<SelectItem value="relays">Relays</SelectItem>
								<SelectItem value="combined">Combined</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="event_id">Specific Event (Optional)</Label>
						<EventLookup
							value={formData.event_id || ""}
							onChange={(value) =>
								setFormData({ ...formData, event_id: value || null })
							}
							label=""
						/>
					</div>

					<div>
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Notes about this responsibility..."
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
									? "Update Responsibility"
									: "Add Responsibility"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
