"use client";

import { useCallback, useEffect, useState } from "react";

import {
	ServerSearchCombobox,
	type ServerSearchComboboxOption,
} from "@/components/server-search-combobox";
import { Label } from "@/components/ui/label";

import { searchAthletes } from "@/features/athletes/actions/searchAthletes";

interface AthleteLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
}

interface Athlete {
	id: string;
	full_name: string;
	contact_email: string | null;
	graduation_year: number | null;
	high_school: string | null;
	state: string | null;
}

export function AthleteLookup({
	value,
	onChange,
	label = "Athlete",
	placeholder = "Search for an athlete...",
	required = false,
	disabled = false,
}: AthleteLookupProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [options, setOptions] = useState<ServerSearchComboboxOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);

	const getDisplayText = useCallback((athlete: Athlete) => {
		const parts = [athlete.full_name];

		// Add graduation year if available
		if (athlete.graduation_year) {
			parts.push(`• Class of ${athlete.graduation_year}`);
		}

		// Add high school if available
		if (athlete.high_school) {
			parts.push(`• ${athlete.high_school}`);
		}

		// Add state if available (and no high school to avoid redundancy)
		if (athlete.state && !athlete.high_school) {
			parts.push(`• ${athlete.state}`);
		}

		return parts.join(" ");
	}, []);

	const getSubtitle = useCallback((athlete: Athlete) => {
		const parts = [];

		if (athlete.contact_email) {
			parts.push(athlete.contact_email);
		}

		// If we have both high school and state, show them together in subtitle
		if (athlete.high_school && athlete.state) {
			parts.push(`${athlete.high_school}, ${athlete.state}`);
		}

		return parts.join(" • ") || undefined;
	}, []);

	const fetchAthletes = useCallback(
		async (searchQuery: string, pageNumber: number, append = false) => {
			setIsLoading(true);
			try {
				const result = await searchAthletes({
					searchTerm: searchQuery,
					page: pageNumber,
					pageSize: 50,
				});

				const newOptions: ServerSearchComboboxOption[] = result.athletes.map(
					(athlete) => ({
						value: athlete.id,
						label: getDisplayText(athlete),
						subtitle: getSubtitle(athlete),
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
				console.error("Error fetching athletes:", error);
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
		fetchAthletes(searchTerm, 0, false);
	}, [searchTerm, fetchAthletes]);

	const handleLoadMore = useCallback(() => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchAthletes(searchTerm, nextPage, true);
	}, [page, searchTerm, fetchAthletes]);

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
				searchPlaceholder="Search by name, email, high school, or state..."
				emptyText="No athletes found matching your search."
				disabled={disabled}
				hasMore={hasMore}
				onLoadMore={handleLoadMore}
				showInitialResults={true}
			/>
		</div>
	);
}
