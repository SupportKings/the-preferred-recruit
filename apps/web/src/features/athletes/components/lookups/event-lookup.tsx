"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Check, ChevronsUpDown } from "lucide-react";

interface EventLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	eventGroup?: string | null;
}

interface Event {
	id: string;
	name: string;
	event_group?: string;
	code?: string;
}

export function EventLookup({
	value,
	onChange,
	label = "Event",
	required = false,
	disabled = false,
	eventGroup,
}: EventLookupProps) {
	const [open, setOpen] = useState(false);
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("events")
				.select("id, name, event_group, code")
				.order("name");

			// Filter by event_group if provided
			if (eventGroup) {
				query = query.eq("event_group", eventGroup);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching events:", error);
				setLoading(false);
				return;
			}
			if (data) {
				console.log(
					`Fetched ${data.length} events${eventGroup ? ` for ${eventGroup}` : ""}`,
				);
				setEvents(data as Event[]);
			}
			setLoading(false);
		};

		fetchEvents();
	}, [eventGroup]);

	const selectedEvent = events.find((event) => event.id === value);

	const filteredEvents = events.filter((event) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			event.name.toLowerCase().includes(searchLower) ||
			event.code?.toLowerCase().includes(searchLower) ||
			event.event_group?.toLowerCase().includes(searchLower)
		);
	});

	return (
		<div className="space-y-2">
			{label && (
				<Label>
					{label}
					{required && <span className="text-destructive"> *</span>}
				</Label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between"
						disabled={disabled || loading}
					>
						{loading
							? "Loading events..."
							: selectedEvent
								? `${selectedEvent.name}${selectedEvent.code ? ` (${selectedEvent.code})` : ""}`
								: "Select event..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search events..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No event found.</CommandEmpty>
							<CommandGroup>
								{filteredEvents.map((event) => (
									<CommandItem
										key={event.id}
										value={`${event.name} ${event.code || ""} ${event.event_group || ""}`}
										onSelect={() => {
											onChange(event.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === event.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{event.name}</span>
											{(event.code || event.event_group) && (
												<span className="text-muted-foreground text-xs">
													{[event.code, event.event_group]
														.filter(Boolean)
														.join(" • ")}
												</span>
											)}
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
