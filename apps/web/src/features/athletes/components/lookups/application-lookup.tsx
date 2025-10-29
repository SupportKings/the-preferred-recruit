"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

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

import { searchAthleteApplications } from "@/features/athletes/actions/athleteApplications";

import { Check, ChevronsUpDown } from "lucide-react";

interface ApplicationLookupProps {
	athleteId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Application {
	id: string;
	university?: {
		name: string;
	} | null;
	program?: {
		gender: string;
	} | null;
	stage?: string | null;
	athlete?: {
		full_name: string;
		contact_email?: string;
	} | null;
}

export function ApplicationLookup({
	athleteId,
	value,
	onChange,
	label = "Application",
	required = false,
	disabled = false,
}: ApplicationLookupProps) {
	const [open, setOpen] = useState(false);
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Debounced search effect
	useEffect(() => {
		const fetchApplications = async () => {
			setLoading(true);
			try {
				const result = await searchAthleteApplications(searchQuery, athleteId);
				if (result.success && result.data) {
					setApplications(result.data as Application[]);
				}
			} catch (error) {
				console.error("Error fetching applications:", error);
				setApplications([]);
			} finally {
				setLoading(false);
			}
		};

		// Debounce: wait 300ms after user stops typing
		const debounceTimer = setTimeout(() => {
			fetchApplications();
		}, 300);

		return () => clearTimeout(debounceTimer);
	}, [searchQuery, athleteId]);

	const selectedApplication = applications.find((app) => app.id === value);

	const getApplicationDisplayName = (app: Application) => {
		const parts = [];

		// Add athlete name first if available (and if we're searching across all athletes)
		if (!athleteId && app.athlete?.full_name) {
			parts.push(app.athlete.full_name);
		}

		// Add university and program
		if (app.university?.name) {
			parts.push(app.university.name);
		}
		if (app.program?.gender) {
			parts.push(app.program.gender);
		}

		return parts.length > 0 ? parts.join(" - ") : "Unknown Application";
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
							? "Loading applications..."
							: selectedApplication
								? getApplicationDisplayName(selectedApplication)
								: "Select application..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder={
								athleteId
									? "Search by university or stage..."
									: "Search by athlete name, university, or stage..."
							}
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							{loading ? (
								<div className="py-6 text-center text-sm">
									Searching applications...
								</div>
							) : applications.length === 0 ? (
								<CommandEmpty>
									{searchQuery
										? "No applications found matching your search."
										: "No applications found."}
								</CommandEmpty>
							) : (
								<CommandGroup>
									{applications.map((app) => (
										<CommandItem
											key={app.id}
											value={app.id}
											onSelect={() => {
												onChange(app.id);
												setOpen(false);
											}}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													value === app.id ? "opacity-100" : "opacity-0",
												)}
											/>
											<div className="flex flex-col">
												<span>{getApplicationDisplayName(app)}</span>
												{app.stage && (
													<span className="text-muted-foreground text-xs">
														Stage: {app.stage}
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
