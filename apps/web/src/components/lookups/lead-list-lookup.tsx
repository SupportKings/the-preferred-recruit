"use client";

import { useCallback, useEffect, useState } from "react";

import {
	ServerSearchCombobox,
	type ServerSearchComboboxOption,
} from "@/components/server-search-combobox";
import { Label } from "@/components/ui/label";

import { searchLeadLists } from "@/features/school-lead-lists/actions/searchLeadLists";

interface LeadListLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
}

interface LeadList {
	id: string;
	name: string;
	type: string | null;
	priority: string | null;
	season_label: string | null;
	athlete: {
		id: string;
		full_name: string;
		contact_email: string | null;
		graduation_year: number | null;
	} | null;
}

// Helper function to format lead list type for display
const formatLeadListType = (type?: string | null): string => {
	if (!type) return "";
	const typeMap: Record<string, string> = {
		d1: "Division I",
		d2: "Division II",
		d3: "Division III",
		naia: "NAIA",
		juco: "Junior College",
		reach: "Reach Schools",
		target: "Target Schools",
		safety: "Safety Schools",
	};
	return typeMap[type] || type;
};

export function LeadListLookup({
	value,
	onChange,
	label = "Lead List",
	placeholder = "Search for a lead list...",
	required = false,
	disabled = false,
}: LeadListLookupProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [options, setOptions] = useState<ServerSearchComboboxOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);

	const getDisplayText = useCallback((leadList: LeadList) => {
		const parts = [leadList.name];

		// Add type and priority if available
		const metadata = [
			formatLeadListType(leadList.type),
			leadList.priority,
		].filter(Boolean);

		if (metadata.length > 0) {
			parts.push(`• ${metadata.join(" • ")}`);
		}

		// Add season label if available
		if (leadList.season_label) {
			parts.push(`• ${leadList.season_label}`);
		}

		return parts.join(" ");
	}, []);

	const getSubtitle = useCallback((leadList: LeadList) => {
		if (!leadList.athlete) return undefined;

		const parts = [leadList.athlete.full_name];

		// Add graduation year if available
		if (leadList.athlete.graduation_year) {
			parts.push(`Class of ${leadList.athlete.graduation_year}`);
		}

		return parts.join(" • ");
	}, []);

	const fetchLeadLists = useCallback(
		async (searchQuery: string, pageNumber: number, append = false) => {
			setIsLoading(true);
			try {
				const result = await searchLeadLists({
					searchTerm: searchQuery,
					page: pageNumber,
					pageSize: 50,
				});

				const newOptions: ServerSearchComboboxOption[] = result.leadLists.map(
					(leadList) => ({
						value: leadList.id,
						label: getDisplayText(leadList),
						subtitle: getSubtitle(leadList),
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
				console.error("Error fetching lead lists:", error);
				setOptions([]);
				setHasMore(false);
			} finally {
				setIsLoading(false);
			}
		},
		[getDisplayText, getSubtitle],
	);

	// Initial load and search term changes
	useEffect(() => {
		setPage(0);
		fetchLeadLists(searchTerm, 0, false);
	}, [searchTerm, fetchLeadLists]);

	const handleLoadMore = useCallback(() => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchLeadLists(searchTerm, nextPage, true);
	}, [page, searchTerm, fetchLeadLists]);

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
				searchPlaceholder="Search by list name, type, priority, or athlete name..."
				emptyText="No lead lists found matching your search."
				disabled={disabled}
				hasMore={hasMore}
				onLoadMore={handleLoadMore}
				showInitialResults={true}
			/>
		</div>
	);
}
