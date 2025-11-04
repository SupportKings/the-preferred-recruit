"use client";

import { useCallback, useEffect, useState } from "react";

import {
	ServerSearchCombobox,
	type ServerSearchComboboxOption,
} from "@/components/server-search-combobox";
import { Label } from "@/components/ui/label";

import { searchCampaigns } from "@/features/campaigns/actions/searchCampaigns";

interface CampaignLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	athleteId?: string;
}

interface Campaign {
	id: string;
	name: string;
	type: string | null;
	status: string | null;
	athlete_id: string;
	athletes?: {
		full_name: string | null;
		graduation_year: number | null;
	} | null;
}

export function CampaignLookup({
	value,
	onChange,
	label = "Campaign",
	required = false,
	disabled = false,
	placeholder = "Select campaign...",
	athleteId,
}: CampaignLookupProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [options, setOptions] = useState<ServerSearchComboboxOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);

	const getDisplayText = useCallback((campaign: Campaign) => {
		const parts = [campaign.name];

		if (campaign.type) {
			parts.push(campaign.type);
		}

		if (campaign.status) {
			parts.push(campaign.status);
		}

		return parts.join(" • ");
	}, []);

	const getSubtitle = useCallback((campaign: Campaign) => {
		if (campaign.athletes?.full_name) {
			const athleteParts = [campaign.athletes.full_name];

			if (campaign.athletes.graduation_year) {
				athleteParts.push(`Class of ${campaign.athletes.graduation_year}`);
			}

			return athleteParts.join(" • ");
		}

		return undefined;
	}, []);

	const fetchCampaigns = useCallback(
		async (searchQuery: string, pageNumber: number, append = false) => {
			setIsLoading(true);
			try {
				const result = await searchCampaigns({
					searchTerm: searchQuery,
					page: pageNumber,
					pageSize: 50,
					athleteId,
				});

				const newOptions: ServerSearchComboboxOption[] = result.campaigns.map(
					(campaign) => ({
						value: campaign.id,
						label: getDisplayText(campaign),
						subtitle: getSubtitle(campaign),
					}),
				);

				if (append) {
					setOptions((prev) => {
						// Create a Set of existing IDs to avoid duplicates
						const existingIds = new Set(prev.map((opt) => opt.value));
						const uniqueNewOptions = newOptions.filter(
							(opt) => !existingIds.has(opt.value),
						);
						return [...prev, ...uniqueNewOptions];
					});
				} else {
					setOptions(newOptions);
				}

				setHasMore(result.hasMore);
			} catch (error) {
				console.error("Error fetching campaigns:", error);
				setOptions([]);
				setHasMore(false);
			} finally {
				setIsLoading(false);
			}
		},
		[athleteId, getDisplayText, getSubtitle],
	);

	// Initial load and search term changes
	useEffect(() => {
		setPage(0);
		fetchCampaigns(searchTerm, 0, false);
	}, [searchTerm, fetchCampaigns]);

	const handleLoadMore = useCallback(() => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchCampaigns(searchTerm, nextPage, true);
	}, [page, searchTerm, fetchCampaigns]);

	const handleSearchChange = (newSearchTerm: string) => {
		setSearchTerm(newSearchTerm);
	};

	const handleValueChange = (newValue: string) => {
		onChange(newValue);
	};

	return (
		<div className="space-y-2">
			{label && (
				<Label>
					{label}
					{required && <span className="text-destructive"> *</span>}
				</Label>
			)}
			<ServerSearchCombobox
				value={value}
				onValueChange={handleValueChange}
				searchTerm={searchTerm}
				onSearchChange={handleSearchChange}
				options={options}
				isLoading={isLoading}
				placeholder={placeholder}
				searchPlaceholder="Search by campaign name..."
				emptyText="No campaigns found matching your search."
				disabled={disabled}
				hasMore={hasMore}
				onLoadMore={handleLoadMore}
				showInitialResults={true}
			/>
		</div>
	);
}
