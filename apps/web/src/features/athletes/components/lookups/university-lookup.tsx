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

interface UniversityLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface University {
	id: string;
	name: string;
	city?: string;
	state?: string;
	region?: string;
}

export function UniversityLookup({
	value,
	onChange,
	label = "University",
	required = false,
	disabled = false,
}: UniversityLookupProps) {
	const [open, setOpen] = useState(false);
	const [universities, setUniversities] = useState<University[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch universities based on search query
	useEffect(() => {
		const fetchUniversities = async () => {
			// Only fetch if search query has at least 2 characters or if we have a selected value
			if (!searchQuery || searchQuery.length < 2) {
				// If there's a selected value, fetch just that university
				if (value) {
					const supabase = createClient();
					const { data, error } = await supabase
						.from("universities")
						.select("id, name, city, state, region")
						.eq("id", value)
						.single();

					if (!error && data) {
						setUniversities([data as University]);
					}
				} else {
					setUniversities([]);
				}
				return;
			}

			setLoading(true);
			const supabase = createClient();

			const { data, error } = await supabase
				.from("universities")
				.select("id, name, city, state, region")
				.ilike("name", `%${searchQuery}%`)
				.order("name")
				.limit(50);

			if (error) {
				console.error("Error fetching universities:", error);
				setLoading(false);
				return;
			}
			if (data) {
				console.log(
					`Fetched ${data.length} universities for query: "${searchQuery}"`,
				);
				setUniversities(data as University[]);
			}
			setLoading(false);
		};

		// Debounce the search
		const timeoutId = setTimeout(() => {
			fetchUniversities();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, value]);

	const selectedUniversity = universities.find((uni) => uni.id === value);

	// Get empty message based on search state
	const getEmptyMessage = () => {
		if (!searchQuery || searchQuery.length < 2) {
			return "Type at least 2 characters to search universities...";
		}
		if (loading) {
			return "Searching...";
		}
		return "No university found.";
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
							? "Loading universities..."
							: selectedUniversity
								? selectedUniversity.name
								: "Select university..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search universities..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>{getEmptyMessage()}</CommandEmpty>
							<CommandGroup>
								{universities.map((uni) => (
									<CommandItem
										key={uni.id}
										value={`${uni.name} ${uni.city || ""} ${uni.state || ""} ${uni.region || ""}`}
										onSelect={() => {
											onChange(uni.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === uni.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{uni.name}</span>
											{(uni.city || uni.state || uni.region) && (
												<span className="text-muted-foreground text-xs">
													{[uni.city, uni.state, uni.region]
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
