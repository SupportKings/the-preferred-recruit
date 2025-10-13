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

interface CoachLookupProps {
	universityId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Coach {
	id: string;
	full_name: string;
	email?: string;
}

export function CoachLookup({
	universityId,
	value,
	onChange,
	label = "Coach",
	required = false,
	disabled = false,
}: CoachLookupProps) {
	const [open, setOpen] = useState(false);
	const [coaches, setCoaches] = useState<Coach[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchCoaches = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("coaches")
				.select("id, full_name, email")
				.order("full_name");

			// Filter by university if provided
			if (universityId) {
				query = query.eq("university_id", universityId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching coaches:", error);
				setLoading(false);
				return;
			}
			if (data) {
				console.log(
					`Fetched ${data.length} coaches from database${universityId ? ` for university ${universityId}` : ""}`,
				);
				if (data.length === 0) {
					console.warn(
						`No coaches found${universityId ? ` for university ${universityId}` : ""}. Table may be empty.`,
					);
				}
				setCoaches(data as Coach[]);
			}
			setLoading(false);
		};

		fetchCoaches();
	}, [universityId]);

	const selectedCoach = coaches.find((coach) => coach.id === value);

	const filteredCoaches = coaches.filter((coach) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			coach.full_name.toLowerCase().includes(searchLower) ||
			coach.email?.toLowerCase().includes(searchLower)
		);
	});

	const getCoachDisplayName = (coach: Coach) => {
		return coach.full_name;
	};

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
							? "Loading coaches..."
							: selectedCoach
								? getCoachDisplayName(selectedCoach)
								: "Select coach..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search coaches..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No coach found.</CommandEmpty>
							<CommandGroup>
								{filteredCoaches.map((coach) => (
									<CommandItem
										key={coach.id}
										value={`${coach.full_name} ${coach.email || ""}`}
										onSelect={() => {
											onChange(coach.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === coach.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{getCoachDisplayName(coach)}</span>
											{coach.email && (
												<span className="text-muted-foreground text-xs">
													{coach.email}
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
