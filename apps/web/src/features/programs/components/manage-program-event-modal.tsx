"use client";

import { useCallback, useEffect, useId, useState } from "react";

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

import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createProgramEventAction } from "../actions/createProgramEvent";
import { updateProgramEventAction } from "../actions/updateProgramEvent";
import { useEvents } from "../queries/useEvents";

interface ManageProgramEventModalProps {
	programId: string;
	programEvent?: {
		id: string;
		event_id: string;
		is_active: boolean;
		start_date: string | null;
		end_date: string | null;
		internal_notes: string | null;
	} | null;
	onSuccess?: () => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

interface Event {
	id: string;
	name: string;
	code?: string;
}

export function ManageProgramEventModal({
	programId,
	programEvent,
	onSuccess,
	open: controlledOpen,
	onOpenChange,
}: ManageProgramEventModalProps) {
	const isEditMode = !!programEvent;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = onOpenChange || setInternalOpen;

	const [eventId, setEventId] = useState(programEvent?.event_id || "");
	const [isActive, setIsActive] = useState(programEvent?.is_active ?? true);
	const [startDate, setStartDate] = useState<string>(
		programEvent?.start_date || "",
	);
	const [endDate, setEndDate] = useState<string>(programEvent?.end_date || "");
	const [internalNotes, setInternalNotes] = useState(
		programEvent?.internal_notes || "",
	);

	const isActiveId = useId();
	const internalNotesId = useId();

	const { data: events, isLoading: isLoadingEvents } = useEvents();

	const { execute: executeCreate, isExecuting: isCreating } = useAction(
		createProgramEventAction,
		{
			onSuccess: (result) => {
				if (result?.data?.success) {
					toast.success("Event added to program successfully!");
					setOpen(false);
					onSuccess?.();
				}
			},
			onError: (err) => {
				console.error("Error adding event:", err);

				const validationErrors = err.error?.validationErrors;
				if (validationErrors) {
					if (validationErrors.event_id?._errors?.[0]) {
						toast.error(validationErrors.event_id._errors[0]);
					} else if (validationErrors._errors?.[0]) {
						toast.error(validationErrors._errors[0]);
					} else {
						toast.error("Validation error. Please check your inputs.");
					}
				} else {
					const errorMessage =
						err.error?.serverError || "Failed to add event. Please try again.";
					toast.error(errorMessage);
				}
			},
		},
	);

	const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
		updateProgramEventAction,
		{
			onSuccess: (result) => {
				if (result?.data?.success) {
					toast.success("Event updated successfully!");
					setOpen(false);
					onSuccess?.();
				}
			},
			onError: (err) => {
				console.error("Error updating event:", err);

				const validationErrors = err.error?.validationErrors;
				if (validationErrors) {
					if (validationErrors.event_id?._errors?.[0]) {
						toast.error(validationErrors.event_id._errors[0]);
					} else if (validationErrors._errors?.[0]) {
						toast.error(validationErrors._errors[0]);
					} else {
						toast.error("Validation error. Please check your inputs.");
					}
				} else {
					const errorMessage =
						err.error?.serverError ||
						"Failed to update event. Please try again.";
					toast.error(errorMessage);
				}
			},
		},
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!eventId) {
			toast.error("Please select an event");
			return;
		}

		if (isEditMode && programEvent) {
			executeUpdate({
				id: programEvent.id,
				program_id: programId,
				event_id: eventId,
				is_active: isActive,
				start_date: startDate || null,
				end_date: endDate || null,
				internal_notes: internalNotes || null,
			});
		} else {
			executeCreate({
				program_id: programId,
				event_id: eventId,
				is_active: isActive,
				start_date: startDate || null,
				end_date: endDate || null,
				internal_notes: internalNotes || null,
			});
		}
	};

	const resetForm = useCallback(() => {
		setEventId("");
		setIsActive(true);
		setStartDate("");
		setEndDate("");
		setInternalNotes("");
	}, []);

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open, resetForm]);

	const isLoading = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{!isEditMode && (
				<DialogTrigger>
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Event
					</Button>
				</DialogTrigger>
			)}
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Program Event" : "Add Event to Program"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update event details for this program"
							: "Associate an event with this program"}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="event_id">
							Event <span className="text-red-500">*</span>
						</Label>
						<Select
							value={eventId}
							onValueChange={setEventId}
							disabled={isEditMode}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select an event" />
							</SelectTrigger>
							<SelectContent>
								{isLoadingEvents ? (
									<SelectItem value="loading" disabled>
										Loading events...
									</SelectItem>
								) : events && events.length > 0 ? (
									events.map((event: Event) => (
										<SelectItem key={event.id} value={event.id}>
											{event.name}
											{event.code ? ` (${event.code})` : ""}
										</SelectItem>
									))
								) : (
									<SelectItem value="no-events" disabled>
										No events available
									</SelectItem>
								)}
							</SelectContent>
						</Select>
						{isEditMode && (
							<p className="text-muted-foreground text-xs">
								Event cannot be changed when editing. Delete and create a new
								entry to assign a different event.
							</p>
						)}
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id={isActiveId}
							checked={isActive}
							onCheckedChange={(checked) => setIsActive(checked as boolean)}
						/>
						<Label htmlFor={isActiveId} className="cursor-pointer font-normal">
							Active
						</Label>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Start Date</Label>
							<DatePicker
								value={startDate}
								onChange={setStartDate}
								placeholder="Pick a date"
							/>
						</div>

						<div className="space-y-2">
							<Label>End Date</Label>
							<DatePicker
								value={endDate}
								onChange={setEndDate}
								placeholder="Pick a date"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor={internalNotesId}>Internal Notes</Label>
						<Textarea
							id={internalNotesId}
							value={internalNotes}
							onChange={(e) => setInternalNotes(e.target.value)}
							placeholder="Add any notes about this event assignment..."
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || !eventId}>
							{isLoading
								? isEditMode
									? "Updating..."
									: "Adding..."
								: isEditMode
									? "Update Event"
									: "Add Event"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
