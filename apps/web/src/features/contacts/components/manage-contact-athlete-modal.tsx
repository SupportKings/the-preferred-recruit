"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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

import { useAthletes } from "@/features/athletes/queries/useAthletes";
import {
	createContactAthlete,
	updateContactAthlete,
} from "@/features/contacts/actions/relations/contactAthletes";
import { contactQueries } from "@/features/contacts/queries/useContacts";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface ManageContactAthleteModalProps {
	contactId: string;
	mode: "add" | "edit";
	contactAthlete?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageContactAthleteModal({
	contactId,
	mode,
	contactAthlete,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageContactAthleteModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	// Fetch athletes for dropdown
	const { data: athletes = [] } = useAthletes();

	const [formData, setFormData] = useState({
		athlete_id: "",
		relationship: "",
		is_primary: false,
		internal_notes: "",
		start_date: format(new Date(), "yyyy-MM-dd"),
		end_date: "",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && contactAthlete) {
			setFormData({
				athlete_id: contactAthlete.athlete_id || "",
				relationship: contactAthlete.relationship || "",
				is_primary: contactAthlete.is_primary || false,
				internal_notes: contactAthlete.internal_notes || "",
				start_date: contactAthlete.start_date
					? format(new Date(contactAthlete.start_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				end_date: contactAthlete.end_date
					? format(new Date(contactAthlete.end_date), "yyyy-MM-dd")
					: "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				athlete_id: "",
				relationship: "",
				is_primary: false,
				internal_notes: "",
				start_date: format(new Date(), "yyyy-MM-dd"),
				end_date: "",
			});
		}
	}, [isEdit, contactAthlete, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.athlete_id) {
			toast.error("Athlete is required");
			return;
		}

		if (!formData.relationship.trim()) {
			toast.error("Relationship is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && contactAthlete) {
				await updateContactAthlete(contactAthlete.id, {
					athlete_id: formData.athlete_id,
					relationship: formData.relationship,
					is_primary: formData.is_primary,
					internal_notes: formData.internal_notes,
					start_date: formData.start_date,
					end_date: formData.end_date || undefined,
				});
				toast.success("Athlete relationship updated successfully!");
			} else {
				await createContactAthlete(contactId, {
					athlete_id: formData.athlete_id,
					relationship: formData.relationship,
					is_primary: formData.is_primary,
					internal_notes: formData.internal_notes,
					start_date: formData.start_date,
					end_date: formData.end_date || undefined,
				});
				toast.success("Athlete relationship added successfully!");
			}

			// Invalidate the contact query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: contactQueries.detail(contactId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} athlete relationship:`,
				error,
			);
			toast.error(
				`Failed to ${isEdit ? "update" : "add"} athlete relationship`,
			);
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
							{isEdit ? "Edit Athlete" : "Add Athlete"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						{isEdit
							? "Edit Athlete Relationship"
							: "Add New Athlete Relationship"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the athlete relationship details."
							: "Add a new athlete relationship for this contact."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Athlete Selection */}
					<div>
						<Label htmlFor="athlete_id">Athlete *</Label>
						<Select
							value={formData.athlete_id || "none"}
							onValueChange={(value) =>
								setFormData({
									...formData,
									athlete_id: value === "none" ? "" : value,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select an athlete" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" disabled>
									Select an athlete
								</SelectItem>
								{athletes.map((athlete: any) => (
									<SelectItem key={athlete.id} value={athlete.id}>
										{athlete.full_name}{" "}
										{athlete.contact_email && `(${athlete.contact_email})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Relationship */}
					<div>
						<Label htmlFor="relationship">Relationship *</Label>
						<Select
							value={formData.relationship || "none"}
							onValueChange={(value) =>
								setFormData({
									...formData,
									relationship: value === "none" ? "" : value,
								})
							}
						>
							<SelectTrigger id="relationship">
								<SelectValue placeholder="Select a relationship" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" disabled>
									Select a relationship
								</SelectItem>
								<SelectItem value="parent">Parent</SelectItem>
								<SelectItem value="guardian">Guardian</SelectItem>
								<SelectItem value="agent">Agent</SelectItem>
								<SelectItem value="coach">Coach</SelectItem>
								<SelectItem value="trainer">Trainer</SelectItem>
								<SelectItem value="advisor">Advisor</SelectItem>
								<SelectItem value="family">Family Member</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Start Date */}
					<div>
						<Label htmlFor="start_date">Start Date</Label>
						<DatePicker
							id="start_date"
							value={formData.start_date}
							onChange={(value) =>
								setFormData({ ...formData, start_date: value })
							}
							placeholder="Select start date"
						/>
					</div>

					{/* End Date */}
					<div>
						<Label htmlFor="end_date">End Date</Label>
						<DatePicker
							id="end_date"
							value={formData.end_date}
							onChange={(value) =>
								setFormData({ ...formData, end_date: value })
							}
							placeholder="Select end date (optional)"
						/>
					</div>

					{/* Internal Notes */}
					<div>
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this relationship"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					{/* Is Primary - Moved to end */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="is_primary"
							checked={formData.is_primary}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, is_primary: !!checked })
							}
						/>
						<Label htmlFor="is_primary">
							Mark as primary contact for this athlete
						</Label>
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
									? "Update Athlete"
									: "Add Athlete"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
