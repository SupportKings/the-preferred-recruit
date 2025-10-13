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

interface ChecklistLookupProps {
	athleteId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Checklist {
	id: string;
	name: string;
	description?: string;
}

export function ChecklistLookup({
	athleteId,
	value,
	onChange,
	label = "Checklist",
	required = false,
	disabled = false,
}: ChecklistLookupProps) {
	const [open, setOpen] = useState(false);
	const [checklists, setChecklists] = useState<Checklist[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchChecklists = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("checklists")
				.select("id, name, description")
				.order("name");

			// Filter by athlete if provided
			if (athleteId) {
				query = query.eq("athlete_id", athleteId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching data:", error);
				setLoading(false);
				return;
			}
			if (data) {
				setChecklists(data as Checklist[]);
			}
			setLoading(false);
		};

		fetchChecklists();
	}, [athleteId]);

	const selectedChecklist = checklists.find(
		(checklist) => checklist.id === value,
	);

	const filteredChecklists = checklists.filter((checklist) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			checklist.name.toLowerCase().includes(searchLower) ||
			checklist.description?.toLowerCase().includes(searchLower)
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
							? "Loading checklists..."
							: selectedChecklist
								? selectedChecklist.name
								: "Select checklist..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search checklists..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No checklist found.</CommandEmpty>
							<CommandGroup>
								{filteredChecklists.map((checklist) => (
									<CommandItem
										key={checklist.id}
										value={`${checklist.name} ${checklist.description || ""}`}
										onSelect={() => {
											onChange(checklist.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === checklist.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{checklist.name}</span>
											{checklist.description && (
												<span className="text-muted-foreground text-xs">
													{checklist.description}
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
