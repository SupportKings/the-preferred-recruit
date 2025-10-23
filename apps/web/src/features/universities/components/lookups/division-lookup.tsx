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

interface DivisionLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Division {
	id: string;
	name: string;
	level?: string;
	governing_body_id?: string;
	is_active?: boolean;
}

export function DivisionLookup({
	value,
	onChange,
	label = "Division",
	required = false,
	disabled = false,
}: DivisionLookupProps) {
	const [open, setOpen] = useState(false);
	const [divisions, setDivisions] = useState<Division[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDivisions = async () => {
			setLoading(true);
			const supabase = createClient();

			const { data, error } = await supabase
				.from("divisions")
				.select("id, name, level, governing_body_id, is_active")
				.eq("is_active", true)
				.order("name");

			if (error) {
				console.error("Error fetching divisions:", error);
				setDivisions([]);
			} else if (data) {
				setDivisions(data as Division[]);
			}
			setLoading(false);
		};

		fetchDivisions();
	}, []);

	const selectedDivision = divisions.find((div) => div.id === value);

	return (
		<div className="space-y-2">
			{label && (
				<Label>
					{label}
					{required && <span className="text-red-500">*</span>}
				</Label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between"
						disabled={disabled}
					>
						{loading
							? "Loading..."
							: selectedDivision
								? selectedDivision.name
								: "Select division..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput placeholder="Search divisions..." />
						<CommandList>
							<CommandEmpty>No division found.</CommandEmpty>
							<CommandGroup>
								{divisions.map((division) => (
									<CommandItem
										key={division.id}
										value={division.name}
										onSelect={() => {
											onChange(division.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === division.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{division.name}</span>
											{division.level && (
												<span className="text-muted-foreground text-xs">
													{division.level}
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
