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

interface UniversityJobLookupProps {
	universityId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface UniversityJob {
	id: string;
	job_title: string | null;
	work_email: string | null;
	coach: {
		id: string;
		full_name: string;
	} | null;
	university: {
		id: string;
		name: string;
		city: string | null;
		state: string | null;
	} | null;
	program: {
		id: string;
		gender: string | null;
	} | null;
}

export function UniversityJobLookup({
	universityId,
	value,
	onChange,
	label = "Coach/Job",
	required = false,
	disabled = false,
}: UniversityJobLookupProps) {
	const [open, setOpen] = useState(false);
	const [universityJobs, setUniversityJobs] = useState<UniversityJob[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const fetchUniversityJobs = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("university_jobs")
				.select(
					`
					id,
					job_title,
					work_email,
					coach:coaches(id, full_name),
					university:universities(id, name, city, state),
					program:programs(id, gender)
				`,
				)
				.eq("is_deleted", false);

			// Filter by university if provided
			if (universityId) {
				query = query.eq("university_id", universityId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching university jobs:", error);
				console.error("Full error details:", JSON.stringify(error, null, 2));
				setLoading(false);
				return;
			}
			if (data) {
				console.log(
					`Fetched ${data.length} university jobs from database${universityId ? ` for university ${universityId}` : ""}`,
				);
				if (data.length === 0) {
					console.warn(
						`No university jobs found${universityId ? ` for university ${universityId}` : ""}. Table may be empty.`,
					);
				} else {
					// Log first few records for debugging
					console.log("Sample university jobs:", data.slice(0, 3));
				}
				setUniversityJobs(data as UniversityJob[]);
			}
			setLoading(false);
		};

		fetchUniversityJobs();
	}, [universityId]);

	const selectedJob = universityJobs.find((job) => job.id === value);

	const filteredJobs = universityJobs.filter((job) => {
		if (!searchQuery) return true;

		const searchLower = searchQuery.toLowerCase();
		const matches =
			job.job_title?.toLowerCase().includes(searchLower) ||
			job.work_email?.toLowerCase().includes(searchLower) ||
			job.coach?.full_name?.toLowerCase().includes(searchLower) ||
			job.university?.name?.toLowerCase().includes(searchLower) ||
			job.university?.city?.toLowerCase().includes(searchLower) ||
			job.university?.state?.toLowerCase().includes(searchLower) ||
			job.program?.gender?.toLowerCase().includes(searchLower);

		return matches;
	});

	// Debug logging - always log when dropdown is open
	console.log("=== UniversityJobLookup Debug ===");
	console.log("Open:", open);
	console.log("Loading:", loading);
	console.log("Search query:", searchQuery || "(empty)");
	console.log("Total university jobs loaded:", universityJobs.length);
	console.log("Filtered jobs count:", filteredJobs.length);
	if (universityJobs.length > 0) {
		console.log("First job sample:", universityJobs[0]);
	}
	if (filteredJobs.length > 0) {
		console.log("First filtered job:", filteredJobs[0]);
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange("");
		setSearchQuery("");
		setOpen(false);
	};

	const handleSelect = (jobId: string) => {
		onChange(jobId);
		setSearchQuery("");
		setOpen(false);
	};

	const getDisplayText = (job: UniversityJob) => {
		const parts = [];

		// Priority: Coach name or job title
		if (job.coach?.full_name) {
			parts.push(job.coach.full_name);
		} else if (job.job_title) {
			parts.push(job.job_title);
		}

		// Program gender
		if (job.program?.gender) {
			const gender =
				job.program.gender === "men"
					? "Men's"
					: job.program.gender === "women"
						? "Women's"
						: job.program.gender;
			parts.push(gender);
		}

		// University name
		if (job.university?.name) {
			parts.push(job.university.name);
		}

		return parts.join(" • ") || "Unknown";
	};

	const _getSecondaryText = (job: UniversityJob) => {
		const parts = [];

		// Job title if we showed coach name as primary
		if (job.coach?.full_name && job.job_title) {
			parts.push(job.job_title);
		}

		// Location
		if (job.university?.city && job.university?.state) {
			parts.push(`${job.university.city}, ${job.university.state}`);
		} else if (job.university?.state) {
			parts.push(job.university.state);
		}

		// Work email
		if (job.work_email) {
			parts.push(job.work_email);
		}

		return parts.join(" • ");
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
					<div
						className="relative"
						onClick={(e) => {
							e.preventDefault();
							if (!open) setOpen(true);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								if (!open) setOpen(true);
							}
						}}
					>
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
							placeholder={
								loading
									? "Loading jobs..."
									: selectedJob
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
								selectedJob && !searchQuery && "cursor-pointer",
							)}
						/>
						{selectedJob && !searchQuery && (
							<div className="absolute inset-y-0 right-8 left-9 flex items-center">
								<Badge variant="secondary" className="max-w-full truncate">
									{getDisplayText(selectedJob)}
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
				</PopoverTrigger>
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
							{loading ? (
								<div className="flex items-center justify-center p-4">
									<Loader2 className="h-4 w-4 animate-spin" />
									<span className="ml-2 text-sm">Loading...</span>
								</div>
							) : filteredJobs.length === 0 ? (
								<CommandEmpty>
									{searchQuery
										? "No jobs found matching your search."
										: universityJobs.length === 0
											? "No university jobs available. Please add some first."
											: "Start typing to search for jobs..."}
								</CommandEmpty>
							) : (
								<CommandGroup>
									{filteredJobs.map((job) => (
										<CommandItem
											key={job.id}
											value={job.id}
											onSelect={() => handleSelect(job.id)}
											className="cursor-pointer"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													value === job.id ? "opacity-100" : "opacity-0",
												)}
											/>
											<div className="flex flex-col">
												<span className="font-medium">
													{getDisplayText(job)}
												</span>
												{job.work_email && (
													<span className="text-muted-foreground text-xs">
														{job.work_email}
													</span>
												)}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
