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

interface AthleteLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Athlete {
	id: string;
	full_name: string;
	contact_email?: string;
	graduation_year?: number;
}

export function AthleteLookup({
	value,
	onChange,
	label = "Athlete",
	required = false,
	disabled = false,
}: AthleteLookupProps) {
	const [open, setOpen] = useState(false);
	const [athletes, setAthletes] = useState<Athlete[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch athletes based on search query
	useEffect(() => {
		const fetchAthletes = async () => {
			// Only fetch if search query has at least 2 characters or if we have a selected value
			if (!searchQuery || searchQuery.length < 2) {
				// If there's a selected value, fetch just that athlete
				if (value) {
					const supabase = createClient();
					const { data, error } = await supabase
						.from("athletes")
						.select("id, full_name, contact_email, graduation_year")
						.eq("id", value)
						.eq("is_deleted", false)
						.single();

					if (!error && data) {
						setAthletes([data as Athlete]);
					}
				} else {
					setAthletes([]);
				}
				return;
			}

			setLoading(true);
			const supabase = createClient();

			const { data, error } = await supabase
				.from("athletes")
				.select("id, full_name, contact_email, graduation_year")
				.eq("is_deleted", false)
				.or(
					`full_name.ilike.%${searchQuery}%,contact_email.ilike.%${searchQuery}%`,
				)
				.order("full_name")
				.limit(50);

			if (error) {
				console.error("Error fetching athletes:", error);
				setAthletes([]);
			} else {
				console.log(
					`Fetched ${data?.length || 0} athletes for query: "${searchQuery}"`,
				);
				setAthletes(data || []);
			}

			setLoading(false);
		};

		// Debounce the search
		const timeoutId = setTimeout(() => {
			fetchAthletes();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, value]);

	const selectedAthlete = athletes.find((athlete) => athlete.id === value);

	// Get empty message based on search state
	const getEmptyMessage = () => {
		if (!searchQuery || searchQuery.length < 2) {
			return "Type at least 2 characters to search by name or email...";
		}
		if (loading) {
			return "Searching...";
		}
		return "No athletes found.";
	};

	return (
		<div className="space-y-2">
			<Label>
				{label}
				{required && <span className="text-destructive"> *</span>}
			</Label>
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
							? "Loading athletes..."
							: value && selectedAthlete
								? selectedAthlete.full_name
								: "Select athlete..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search by name or email..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>{getEmptyMessage()}</CommandEmpty>
							<CommandGroup>
								{athletes.map((athlete) => (
									<CommandItem
										key={athlete.id}
										value={`${athlete.full_name} ${athlete.contact_email || ""} ${athlete.graduation_year || ""}`}
										onSelect={() => {
											onChange(athlete.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === athlete.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span className="font-medium">{athlete.full_name}</span>
											<span className="text-muted-foreground text-xs">
												{athlete.contact_email}
												{athlete.graduation_year &&
													` • Class of ${athlete.graduation_year}`}
											</span>
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
