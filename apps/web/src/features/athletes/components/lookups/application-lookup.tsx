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
	};
	program?: {
		name: string;
	};
	stage?: string;
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
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchApplications = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("athlete_applications")
				.select(
					`
					id,
					stage,
					university:universities(name),
					program:programs(name)
				`,
				)
				.order("created_at", { ascending: false });

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
				setApplications(data as Application[]);
			}
			setLoading(false);
		};

		fetchApplications();
	}, [athleteId]);

	const selectedApplication = applications.find((app) => app.id === value);

	const filteredApplications = applications.filter((app) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			app.university?.name.toLowerCase().includes(searchLower) ||
			app.program?.name.toLowerCase().includes(searchLower) ||
			app.stage?.toLowerCase().includes(searchLower)
		);
	});

	const getApplicationDisplayName = (app: Application) => {
		const parts = [app.university?.name, app.program?.name].filter(Boolean);
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
					<Command>
						<CommandInput
							placeholder="Search applications..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No application found.</CommandEmpty>
							<CommandGroup>
								{filteredApplications.map((app) => (
									<CommandItem
										key={app.id}
										value={`${app.university?.name || ""} ${app.program?.name || ""} ${app.stage || ""}`}
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
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
