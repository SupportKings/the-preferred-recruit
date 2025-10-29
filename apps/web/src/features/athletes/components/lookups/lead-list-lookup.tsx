"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { createClient } from "@/utils/supabase/client";

// Helper function to format lead list type for display
const formatLeadListType = (type?: string): string => {
	if (!type) return "";
	const typeMap: Record<string, string> = {
		d1: "Division I",
		d2: "Division II",
		d3: "Division III",
		naia: "NAIA",
		juco: "Junior College",
		reach: "Reach Schools",
		target: "Target Schools",
		safety: "Safety Schools",
	};
	return typeMap[type] || type;
};

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

interface LeadListLookupProps {
	athleteId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface LeadList {
	id: string;
	name: string;
	type?: string;
	priority?: string;
}

export function LeadListLookup({
	athleteId,
	value,
	onChange,
	label = "Lead List",
	required = false,
	disabled = false,
}: LeadListLookupProps) {
	const [open, setOpen] = useState(false);
	const [leadLists, setLeadLists] = useState<LeadList[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchLeadLists = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("school_lead_lists")
				.select("id, name, type, priority")
				.order("name");

			// Filter by athlete if provided
			if (athleteId) {
				query = query.eq("athlete_id", athleteId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching lead lists:", error);
				setLoading(false);
				return;
			}
			if (data) {
				console.log(`Fetched ${data.length} lead lists`);
				setLeadLists(data as LeadList[]);
			}
			setLoading(false);
		};

		fetchLeadLists();
	}, [athleteId]);

	const selectedLeadList = leadLists.find((list) => list.id === value);

	const filteredLeadLists = leadLists.filter((list) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			list.name.toLowerCase().includes(searchLower) ||
			list.type?.toLowerCase().includes(searchLower) ||
			list.priority?.toLowerCase().includes(searchLower)
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
							? "Loading lead lists..."
							: selectedLeadList
								? selectedLeadList.name
								: "Select lead list..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search lead lists..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No lead list found.</CommandEmpty>
							<CommandGroup>
								{filteredLeadLists.map((list) => (
									<CommandItem
										key={list.id}
										value={`${list.name} ${formatLeadListType(list.type)} ${list.priority || ""}`}
										onSelect={() => {
											onChange(list.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === list.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{list.name}</span>
											{(list.type || list.priority) && (
												<span className="text-muted-foreground text-xs">
													{[formatLeadListType(list.type), list.priority]
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
