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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { EventLookup } from "../lookups/event-lookup";

import {
	createAthleteResult,
	updateAthleteResult,
} from "@/features/athletes/actions/athleteResults";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

interface ManageResultModalProps {
	athleteId: string;
	mode: "add" | "edit";
	result?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageResultModal({
	athleteId,
	mode,
	result,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageResultModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		event_id: "",
		performance_mark: "",
		date_recorded: format(new Date(), "yyyy-MM-dd"),
		location: "",
		hand_timed: false,
		wind: "",
		altitude: false,
		organized_event: true,
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && result) {
			setFormData({
				event_id: result.event_id || "",
				performance_mark: result.performance_mark || "",
				date_recorded: result.date_recorded
					? format(new Date(result.date_recorded), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				location: result.location || "",
				hand_timed: result.hand_timed || false,
				wind: result.wind || "",
				altitude: result.altitude || false,
				organized_event: result.organized_event ?? true,
				internal_notes: result.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				event_id: "",
				performance_mark: "",
				date_recorded: format(new Date(), "yyyy-MM-dd"),
				location: "",
				hand_timed: false,
				wind: "",
				altitude: false,
				organized_event: true,
				internal_notes: "",
			});
		}
	}, [isEdit, result, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.event_id) {
			toast.error("Event is required");
			return;
		}

		if (!formData.performance_mark) {
			toast.error("Performance mark is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && result) {
				await updateAthleteResult(result.id, {
					event_id: formData.event_id,
					performance_mark: formData.performance_mark,
					date_recorded: formData.date_recorded,
					location: formData.location,
					hand_timed: formData.hand_timed,
					wind: formData.wind,
					altitude: formData.altitude,
					organized_event: formData.organized_event,
					internal_notes: formData.internal_notes,
				});
				toast.success("Result updated successfully!");
			} else {
				await createAthleteResult(athleteId, {
					event_id: formData.event_id,
					performance_mark: formData.performance_mark,
					date_recorded: formData.date_recorded,
					location: formData.location,
					hand_timed: formData.hand_timed,
					wind: formData.wind,
					altitude: formData.altitude,
					organized_event: formData.organized_event,
					internal_notes: formData.internal_notes,
				});
				toast.success("Result added successfully!");
			}

			// Invalidate the athlete query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			setOpen(false);
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} result:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} result`);
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
							Add Result
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						{isEdit ? "Edit Result" : "Add New Result"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the athletic performance result."
							: "Add a new performance result for this athlete."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<EventLookup
						value={formData.event_id}
						onChange={(value) => setFormData({ ...formData, event_id: value })}
						label="Event"
						required
					/>

					{/* Performance Mark */}
					<div>
						<Label htmlFor="performance_mark">Performance Mark *</Label>
						<Input
							id="performance_mark"
							placeholder="e.g., 10.50"
							value={formData.performance_mark}
							onChange={(e) =>
								setFormData({ ...formData, performance_mark: e.target.value })
							}
							required
						/>
					</div>

					{/* Date Recorded */}
					<div>
						<Label htmlFor="date_recorded">Date Recorded</Label>
						<DatePicker
							id="date_recorded"
							value={formData.date_recorded}
							onChange={(value) =>
								setFormData({ ...formData, date_recorded: value })
							}
							placeholder="Select date"
						/>
					</div>

					{/* Location */}
					<div>
						<Label htmlFor="location">Location</Label>
						<Input
							id="location"
							placeholder="e.g., State Championships"
							value={formData.location}
							onChange={(e) =>
								setFormData({ ...formData, location: e.target.value })
							}
						/>
					</div>

					{/* Wind */}
					<div>
						<Label htmlFor="wind">Wind</Label>
						<Input
							id="wind"
							placeholder="e.g., +2.0"
							value={formData.wind}
							onChange={(e) => setFormData({ ...formData, wind: e.target.value })}
						/>
					</div>

					{/* Checkboxes */}
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="hand_timed"
								checked={formData.hand_timed}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, hand_timed: !!checked })
								}
							/>
							<Label htmlFor="hand_timed">Hand Timed</Label>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="altitude"
								checked={formData.altitude}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, altitude: !!checked })
								}
							/>
							<Label htmlFor="altitude">Altitude-Aided</Label>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="organized_event"
								checked={formData.organized_event}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, organized_event: !!checked })
								}
							/>
							<Label htmlFor="organized_event">Organized Event</Label>
						</div>
					</div>

					{/* Internal Notes */}
					<div>
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this result"
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
									? "Update Result"
									: "Add Result"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
