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

interface CampaignLookupProps {
	athleteId?: string;
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Campaign {
	id: string;
	name: string;
	type?: string;
	status?: string;
}

export function CampaignLookup({
	athleteId,
	value,
	onChange,
	label = "Campaign",
	required = false,
	disabled = false,
}: CampaignLookupProps) {
	const [open, setOpen] = useState(false);
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchCampaigns = async () => {
			setLoading(true);
			const supabase = createClient();

			let query = supabase
				.from("campaigns")
				.select("id, name, type, status")
				.order("name");

			// Filter by athlete if provided
			if (athleteId) {
				query = query.eq("athlete_id", athleteId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching campaigns:", error);
				setLoading(false);
				return;
			}
			if (data) {
				console.log(`Fetched ${data.length} campaigns`);
				setCampaigns(data as Campaign[]);
			}
			setLoading(false);
		};

		fetchCampaigns();
	}, [athleteId]);

	const selectedCampaign = campaigns.find((campaign) => campaign.id === value);

	const filteredCampaigns = campaigns.filter((campaign) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			campaign.name.toLowerCase().includes(searchLower) ||
			campaign.type?.toLowerCase().includes(searchLower) ||
			campaign.status?.toLowerCase().includes(searchLower)
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
							? "Loading campaigns..."
							: selectedCampaign
								? selectedCampaign.name
								: "Select campaign..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search campaigns..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No campaign found.</CommandEmpty>
							<CommandGroup>
								{filteredCampaigns.map((campaign) => (
									<CommandItem
										key={campaign.id}
										value={`${campaign.name} ${campaign.type || ""} ${campaign.status || ""}`}
										onSelect={() => {
											onChange(campaign.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === campaign.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{campaign.name}</span>
											{(campaign.type || campaign.status) && (
												<span className="text-muted-foreground text-xs">
													{[campaign.type, campaign.status]
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
