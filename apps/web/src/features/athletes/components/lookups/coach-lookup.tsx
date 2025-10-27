"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";

import { searchCoaches } from "@/features/coaches/actions/getCoach";

import { Check, Loader2, Search, X } from "lucide-react";

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
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// Fetch selected coach details when value changes
	useEffect(() => {
		const fetchSelectedCoach = async () => {
			if (value) {
				// Check if we already have the coach in our coaches list
				const foundInList = coaches.find((coach) => coach.id === value);
				if (foundInList) {
					setSelectedCoach(foundInList);
				} else {
					// Fetch directly by ID from Supabase
					const { createClient } = await import("@/utils/supabase/client");
					const supabase = createClient();
					const { data, error } = await supabase
						.from("coaches")
						.select("id, full_name, email")
						.eq("id", value)
						.single();

					if (!error && data) {
						setSelectedCoach(data);
					}
				}
			} else {
				setSelectedCoach(null);
			}
		};

		fetchSelectedCoach();
	}, [value, coaches]);

	// Debounced search
	useEffect(() => {
		// Clear previous timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Don't search if query is empty or too short
		if (!searchQuery || searchQuery.trim().length < 2) {
			console.log("[CoachLookup] Query too short:", searchQuery);
			// Only clear coaches if there was a search query before
			if (searchQuery && searchQuery.trim().length > 0) {
				setCoaches([]);
			}
			setLoading(false);
			return;
		}

		console.log("[CoachLookup] Starting search for:", searchQuery);
		// Set loading state immediately
		setLoading(true);

		// Debounce the search
		debounceTimerRef.current = setTimeout(async () => {
			console.log("[CoachLookup] Executing search for:", searchQuery);
			const results = await searchCoaches(searchQuery, universityId);
			console.log("[CoachLookup] Got results:", results.length);
			setCoaches(results);
			setLoading(false);
		}, 300);

		// Cleanup
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [searchQuery, universityId]);

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange("");
		setSearchQuery("");
		setOpen(false);
	};

	const handleSelect = (coachId: string) => {
		onChange(coachId);
		setSearchQuery("");
		setOpen(false);
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
				<PopoverAnchor asChild>
					<div ref={containerRef} className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
							) : (
								<Search className="h-4 w-4 text-muted-foreground" />
							)}
						</div>
						<Input
							ref={inputRef}
							type="text"
							placeholder="Search for a coach by name..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								if (!open) setOpen(true);
							}}
							onClick={() => setOpen(true)}
							onFocus={() => setOpen(true)}
							disabled={disabled}
							className={cn(
								"cursor-pointer pr-8 pl-9",
								selectedCoach &&
									!searchQuery &&
									"text-transparent placeholder:text-transparent",
							)}
						/>
						{selectedCoach && !searchQuery && (
							<div className="pointer-events-none absolute inset-y-0 right-8 left-9 flex items-center">
								<Badge variant="secondary" className="max-w-full truncate">
									{selectedCoach.full_name}
								</Badge>
							</div>
						)}
						{value && (
							<button
								type="button"
								onClick={handleClear}
								className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
								disabled={disabled}
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
				</PopoverAnchor>
				<PopoverContent
					className="w-[var(--radix-popover-trigger-width)] p-0"
					align="start"
					side="bottom"
					sideOffset={4}
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						inputRef.current?.focus();
					}}
					style={{
						width: containerRef.current?.offsetWidth
							? `${containerRef.current.offsetWidth}px`
							: undefined,
					}}
				>
					<Command shouldFilter={false}>
						<CommandList className="max-h-[300px]">
							{loading ? (
								<div className="py-6 text-center text-muted-foreground text-sm">
									<Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
									Searching coaches...
								</div>
							) : coaches.length > 0 ? (
								<CommandGroup>
									{coaches.map((coach) => (
										<CommandItem
											key={coach.id}
											value={coach.id}
											onSelect={() => handleSelect(coach.id)}
											className="cursor-pointer"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													value === coach.id ? "opacity-100" : "opacity-0",
												)}
											/>
											<div className="flex flex-col">
												<span className="font-medium">{coach.full_name}</span>
												{coach.email && (
													<span className="text-muted-foreground text-xs">
														{coach.email}
													</span>
												)}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							) : (
								<div className="py-6 text-center text-muted-foreground text-sm">
									{searchQuery && searchQuery.trim().length >= 2
										? "No coaches found matching your search."
										: "Type at least 2 characters to search for coaches..."}
								</div>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
