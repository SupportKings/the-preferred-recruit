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
	division_raw?: string;
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
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchUniversities = async () => {
			setLoading(true);
			const supabase = createClient();

			const { data, error } = await supabase
				.from("universities")
				.select("id, name, city, state, region, division_raw")
				.order("name");

			if (error) {
				console.error("Error fetching universities:", error);
				setUniversities([]);
			} else if (data) {
				console.log(`Fetched ${data.length} universities from database`);
				if (data.length === 0) {
					console.warn(
						"No universities found in database. Table may be empty.",
					);
				}
				setUniversities(data as University[]);
			}
			setLoading(false);
		};

		fetchUniversities();
	}, []);

	const selectedUniversity = universities.find((uni) => uni.id === value);

	const filteredUniversities = universities.filter((uni) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			uni.name.toLowerCase().includes(searchLower) ||
			uni.city?.toLowerCase().includes(searchLower) ||
			uni.state?.toLowerCase().includes(searchLower) ||
			uni.region?.toLowerCase().includes(searchLower) ||
			uni.division_raw?.toLowerCase().includes(searchLower)
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
							<CommandEmpty>No university found.</CommandEmpty>
							<CommandGroup>
								{filteredUniversities.map((uni) => (
									<CommandItem
										key={uni.id}
										value={`${uni.name} ${uni.city || ""} ${uni.state || ""} ${uni.region || ""} ${uni.division_raw || ""}`}
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
											{(uni.city ||
												uni.state ||
												uni.region ||
												uni.division_raw) && (
												<span className="text-muted-foreground text-xs">
													{[uni.city, uni.state, uni.region, uni.division_raw]
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
