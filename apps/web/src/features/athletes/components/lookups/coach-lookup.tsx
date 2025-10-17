"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { createClient } from "@/utils/supabase/client";

import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

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
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

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
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						) : (
							<Search className="h-4 w-4 text-muted-foreground" />
						)}
					</div>
					<PopoverTrigger asChild>
						<Input
							ref={inputRef}
							type="text"
							placeholder={
								loading
									? "Loading coaches..."
									: selectedCoach
										? ""
										: "Search for a coach or job..."
							}
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								if (!open) setOpen(true);
							}}
							onFocus={() => setOpen(true)}
							disabled={disabled || loading}
							className={cn(
								"pr-8 pl-9",
								selectedCoach && !searchQuery && "cursor-pointer",
							)}
						/>
					</PopoverTrigger>
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
				<PopoverContent
					className="w-[var(--radix-popover-trigger-width)] p-0"
					align="start"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						inputRef.current?.focus();
					}}
				>
					<Command shouldFilter={false}>
						<CommandList>
							<CommandEmpty>
								{searchQuery
									? "No coaches found matching your search."
									: "Start typing to search for coaches..."}
							</CommandEmpty>
							<CommandGroup>
								{filteredCoaches.length > 0 &&
									filteredCoaches.map((coach) => (
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
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
