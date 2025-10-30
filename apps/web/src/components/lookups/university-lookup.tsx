"use client";

import { useCallback, useEffect, useState } from "react";

import {
	ServerSearchCombobox,
	type ServerSearchComboboxOption,
} from "@/components/server-search-combobox";
import { Label } from "@/components/ui/label";

import { searchUniversities } from "@/features/universities/actions/searchUniversities";

interface UniversityLookupProps {
	value?: string;
	onChange: (value: string) => void;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
}

interface University {
	id: string;
	name: string;
	city: string | null;
	state: string | null;
}

export function UniversityLookup({
	value,
	onChange,
	label = "University",
	required = false,
	disabled = false,
	placeholder = "Select university...",
}: UniversityLookupProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [options, setOptions] = useState<ServerSearchComboboxOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);

	const getDisplayText = useCallback((university: University) => {
		const parts = [university.name];

		if (university.city && university.state) {
			parts.push(`${university.city}, ${university.state}`);
		} else if (university.state) {
			parts.push(university.state);
		} else if (university.city) {
			parts.push(university.city);
		}

		return parts.join(" • ");
	}, []);

	const fetchUniversities = useCallback(
		async (searchQuery: string, pageNumber: number, append = false) => {
			setIsLoading(true);
			try {
				const result = await searchUniversities({
					searchTerm: searchQuery,
					page: pageNumber,
					pageSize: 50,
				});

				const newOptions: ServerSearchComboboxOption[] =
					result.universities.map((university) => ({
						value: university.id,
						label: getDisplayText(university),
					}));

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
				console.error("Error fetching universities:", error);
				setOptions([]);
				setHasMore(false);
			} finally {
				setIsLoading(false);
			}
		},
		[getDisplayText],
	);

	// Initial load and search term changes
	useEffect(() => {
		setPage(0);
		fetchUniversities(searchTerm, 0, false);
	}, [searchTerm, fetchUniversities]);

	const handleLoadMore = useCallback(() => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchUniversities(searchTerm, nextPage, true);
	}, [page, searchTerm, fetchUniversities]);

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
				searchPlaceholder="Search by name, city, or state..."
				emptyText="No universities found matching your search."
				disabled={disabled}
				hasMore={hasMore}
				onLoadMore={handleLoadMore}
				showInitialResults={true}
			/>
		</div>
	);
}
