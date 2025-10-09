"use client";

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

import { format } from "date-fns";
import { Calendar, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteProgramEventAction } from "../../actions/deleteProgramEvent";
import { ManageProgramEventModal } from "../manage-program-event-modal";

interface ProgramEventsTabProps {
	events: any[];
	programId: string;
	onRefresh: () => void;
}

export function ProgramEventsTab({
	events,
	programId,
	onRefresh,
}: ProgramEventsTabProps) {
	const { execute: executeDelete, isExecuting: isDeleting } = useAction(
		deleteProgramEventAction,
		{
			onSuccess: () => {
				toast.success("Event removed from program successfully");
				onRefresh();
			},
			onError: (err) => {
				console.error("Error deleting program event:", err);
				toast.error(
					err.error.serverError || "Failed to remove event. Please try again.",
				);
			},
		},
	);

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Not set";
		try {
			return format(new Date(dateString), "MMM dd, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	if (events.length === 0) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Program Events
						</CardTitle>
						<ManageProgramEventModal
							programId={programId}
							onSuccess={onRefresh}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						<Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p className="text-sm">No events yet</p>
						<p className="mt-1 text-xs">
							Events will appear here once added to this program
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Program Events
					</CardTitle>
					<ManageProgramEventModal
						programId={programId}
						onSuccess={onRefresh}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Event</TableHead>
								<TableHead>Code</TableHead>
								<TableHead>Group</TableHead>
								<TableHead>Active?</TableHead>
								<TableHead>Start Date</TableHead>
								<TableHead>End Date</TableHead>
								<TableHead>Notes</TableHead>
								<TableHead className="w-[50px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{events.map((event) => (
								<TableRow key={event.id}>
									<TableCell className="font-medium">
										{event.events?.name || "Unknown Event"}
									</TableCell>
									<TableCell>{event.events?.code || "-"}</TableCell>
									<TableCell className="capitalize">
										{event.events?.event_group || "-"}
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
												event.is_active
													? "bg-green-50 text-green-700"
													: "bg-gray-50 text-gray-700"
											}`}
										>
											{event.is_active ? "Active" : "Inactive"}
										</span>
									</TableCell>
									<TableCell>{formatDate(event.start_date)}</TableCell>
									<TableCell>{formatDate(event.end_date)}</TableCell>
									<TableCell className="max-w-[200px] truncate">
										{event.internal_notes || "-"}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												executeDelete({
													id: event.id,
													program_id: programId,
												})
											}
											disabled={isDeleting}
										>
											<Trash2 className="h-4 w-4 text-red-600" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
