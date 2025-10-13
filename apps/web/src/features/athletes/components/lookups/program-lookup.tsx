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

interface ProgramLookupProps {
	universityId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Program {
	id: string;
	name: string;
	gender?: string;
	sport?: string;
}

export function ProgramLookup({
	universityId,
	value,
	onChange,
	label = "Program",
	required = false,
	disabled = false,
}: ProgramLookupProps) {
	const [open, setOpen] = useState(false);
	const [programs, setPrograms] = useState<Program[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchPrograms = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("programs")
				.select("id, name, gender, sport")
				.order("name");

			// Filter by university if provided
			if (universityId) {
				query = query.eq("university_id", universityId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching programs:", error);
				setLoading(false);
				return;
			}
			if (data) {
				console.log(
					`Fetched ${data.length} programs from database${universityId ? ` for university ${universityId}` : ""}`,
				);
				if (data.length === 0) {
					console.warn(
						`No programs found${universityId ? ` for university ${universityId}` : ""}. Table may be empty.`,
					);
				}
				setPrograms(data as Program[]);
			}
			setLoading(false);
		};

		fetchPrograms();
	}, [universityId]);

	const selectedProgram = programs.find((program) => program.id === value);

	const filteredPrograms = programs.filter((program) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			program.name.toLowerCase().includes(searchLower) ||
			program.gender?.toLowerCase().includes(searchLower) ||
			program.sport?.toLowerCase().includes(searchLower)
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
							? "Loading programs..."
							: selectedProgram
								? selectedProgram.name
								: "Select program..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search programs..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No program found.</CommandEmpty>
							<CommandGroup>
								{filteredPrograms.map((program) => (
									<CommandItem
										key={program.id}
										value={`${program.name} ${program.sport || ""} ${program.gender || ""}`}
										onSelect={() => {
											onChange(program.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === program.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{program.name}</span>
											{(program.sport || program.gender) && (
												<span className="text-muted-foreground text-xs">
													{[program.sport, program.gender]
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
