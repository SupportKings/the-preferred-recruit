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
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchAthletes = async () => {
			setLoading(true);
			const supabase = createClient();

			const query = supabase
				.from("athletes")
				.select("id, full_name, contact_email, graduation_year")
				.order("full_name");

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching athletes:", error);
				setAthletes([]);
			} else {
				setAthletes(data || []);
			}

			setLoading(false);
		};

		fetchAthletes();
	}, []);

	const selectedAthlete = athletes.find((athlete) => athlete.id === value);

	const filteredAthletes = athletes.filter((athlete) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			athlete.full_name?.toLowerCase().includes(searchLower) ||
			athlete.contact_email?.toLowerCase().includes(searchLower) ||
			athlete.graduation_year?.toString().includes(searchLower)
		);
	});

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
							placeholder="Search athletes..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No athletes found.</CommandEmpty>
							<CommandGroup>
								{filteredAthletes.map((athlete) => (
									<CommandItem
										key={athlete.id}
										value={athlete.id}
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
