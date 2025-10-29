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

interface ConferenceLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Conference {
	id: string;
	name: string;
	governing_body_id?: string;
	is_active?: boolean;
}

export function ConferenceLookup({
	value,
	onChange,
	label = "Conference",
	required = false,
	disabled = false,
}: ConferenceLookupProps) {
	const [open, setOpen] = useState(false);
	const [conferences, setConferences] = useState<Conference[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchConferences = async () => {
			setLoading(true);
			const supabase = createClient();

			const { data, error } = await supabase
				.from("conferences")
				.select("id, name, governing_body_id, is_active")
				.eq("is_active", true)
				.order("name");

			if (error) {
				console.error("Error fetching conferences:", error);
				setConferences([]);
			} else if (data) {
				setConferences(data as Conference[]);
			}
			setLoading(false);
		};

		fetchConferences();
	}, []);

	const selectedConference = conferences.find((conf) => conf.id === value);

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
							: selectedConference
								? selectedConference.name
								: "Select conference..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput placeholder="Search conferences..." />
						<CommandList>
							<CommandEmpty>No conference found.</CommandEmpty>
							<CommandGroup>
								{conferences.map((conference) => (
									<CommandItem
										key={conference.id}
										value={conference.name}
										onSelect={() => {
											onChange(conference.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === conference.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{conference.name}</span>
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
