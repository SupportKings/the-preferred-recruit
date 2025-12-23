"use client";

import { useCallback, useEffect, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Check, ChevronsUpDown, Plus } from "lucide-react";

interface DomainLookupWithCreateProps {
	value?: string;
	onChange: (value: string, domainUrl?: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	onDomainCreated?: (domain: any) => void;
	athleteId?: string;
}

interface Domain {
	id: string;
	domain_url: string | null;
}

export function DomainLookupWithCreate({
	value,
	onChange,
	label = "Domain",
	required = false,
	disabled = false,
	onDomainCreated,
	athleteId,
}: DomainLookupWithCreateProps) {
	const [open, setOpen] = useState(false);
	const [domains, setDomains] = useState<Domain[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateInput, setShowCreateInput] = useState(false);
	const [newDomainUrl, setNewDomainUrl] = useState("");

	const fetchDomains = useCallback(async () => {
		setLoading(true);
		const supabase = createClient();

		const baseQuery = supabase
			.from("domains")
			.select("id, domain_url")
			.eq("is_deleted", false);

		const { data, error } = athleteId
			? await baseQuery.eq("athlete_id", athleteId).order("domain_url")
			: await baseQuery.order("domain_url");

		if (error) {
			console.error("Error fetching domains:", error);
			setLoading(false);
			return;
		}
		if (data) {
			// Remove duplicates by domain_url, keeping only the first occurrence
			const uniqueDomains = data.reduce(
				(acc: Domain[], current: { id: string; domain_url: string | null }) => {
					const isDuplicate = acc.some(
						(domain) => domain.domain_url === current.domain_url,
					);
					if (!isDuplicate) {
						acc.push(current);
					}
					return acc;
				},
				[],
			);
			setDomains(uniqueDomains);
		}
		setLoading(false);
	}, [athleteId]);

	useEffect(() => {
		fetchDomains();
	}, [fetchDomains]);

	const selectedDomain = domains.find((domain) => domain.id === value);

	const filteredDomains = domains.filter((domain) => {
		const searchLower = searchQuery.toLowerCase();
		return domain.domain_url?.toLowerCase().includes(searchLower);
	});

	const handleCreateDomain = async () => {
		if (!newDomainUrl.trim()) return;

		const normalizedUrl = newDomainUrl.trim().toLowerCase();

		// Check if domain already exists in the fetched list
		const existingDomain = domains.find(
			(d) => d.domain_url?.toLowerCase() === normalizedUrl,
		);

		if (existingDomain) {
			// Select the existing domain instead of creating a new one
			onChange(existingDomain.id, existingDomain.domain_url || undefined);
			setShowCreateInput(false);
			setNewDomainUrl("");
			setOpen(false);
			return;
		}

		const pendingDomainId = `pending-${crypto.randomUUID()}`;
		const domain = {
			id: pendingDomainId,
			domain_url: normalizedUrl,
		};

		// Mark as pending (will be created in the modal when form is submitted)
		onChange(domain.id, domain.domain_url);
		setShowCreateInput(false);
		setNewDomainUrl("");
		setOpen(false);

		// Call callback to notify parent that domain creation is pending
		if (onDomainCreated) {
			onDomainCreated(domain);
		}
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
							? "Loading domains..."
							: selectedDomain
								? selectedDomain.domain_url
								: "Select or create domain..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						{!showCreateInput ? (
							<>
								<CommandInput
									placeholder="Search domains..."
									value={searchQuery}
									onValueChange={setSearchQuery}
								/>
								<CommandList>
									<CommandEmpty>
										<div className="p-2 text-center">
											<p className="text-muted-foreground text-sm">
												No domain found.
											</p>
											<Button
												variant="outline"
												size="sm"
												className="mt-2"
												onClick={() => {
													setShowCreateInput(true);
													setNewDomainUrl(searchQuery);
												}}
											>
												<Plus className="mr-2 h-4 w-4" />
												Create "{searchQuery}"
											</Button>
										</div>
									</CommandEmpty>
									<CommandGroup>
										<CommandItem
											onSelect={() => {
												setShowCreateInput(true);
												setNewDomainUrl("");
											}}
											className="text-primary"
										>
											<Plus className="mr-2 h-4 w-4" />
											Create new domain
										</CommandItem>
										{filteredDomains.map((domain) => (
											<CommandItem
												key={domain.id}
												value={domain.domain_url || ""}
												onSelect={() => {
													onChange(domain.id, domain.domain_url || undefined);
													setOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														value === domain.id ? "opacity-100" : "opacity-0",
													)}
												/>
												{domain.domain_url}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</>
						) : (
							<div className="p-4">
								<div className="mb-3 space-y-1">
									<div className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
											<Plus className="h-4 w-4 text-primary" />
										</div>
										<h4 className="font-semibold text-sm">Create New Domain</h4>
									</div>
									<p className="text-muted-foreground text-xs">
										Enter the domain URL without http:// or www
									</p>
								</div>
								<div className="space-y-3">
									<div className="space-y-2">
										<div className="relative">
											<Input
												id="new-domain"
												placeholder="example.com"
												value={newDomainUrl}
												onChange={(e) =>
													setNewDomainUrl(e.target.value.toLowerCase())
												}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														handleCreateDomain();
													}
													if (e.key === "Escape") {
														setShowCreateInput(false);
														setNewDomainUrl("");
													}
												}}
												autoFocus
												className="font-mono text-sm"
											/>
										</div>
										{newDomainUrl && (
											<p className="text-muted-foreground text-xs">
												Preview:{" "}
												<span className="font-mono">{newDomainUrl}</span>
											</p>
										)}
									</div>
									<div className="flex gap-2 pt-1">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="flex-1"
											onClick={() => {
												setShowCreateInput(false);
												setNewDomainUrl("");
											}}
										>
											Cancel
										</Button>
										<Button
											type="button"
											size="sm"
											className="flex-1"
											onClick={handleCreateDomain}
											disabled={!newDomainUrl.trim()}
										>
											<Plus className="mr-1.5 h-3.5 w-3.5" />
											Create
										</Button>
									</div>
								</div>
							</div>
						)}
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
