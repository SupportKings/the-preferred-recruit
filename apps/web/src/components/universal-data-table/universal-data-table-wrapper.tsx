"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";
import type { UniversalTableConfig, UniversalTableRow } from "./types";

const filtersSchema = z.custom<FiltersState>();

interface UniversalDataTableWrapperProps<T extends UniversalTableRow>
	extends Omit<UniversalTableConfig<T>, "enableUrlState" | "urlStateKey"> {
	children: (state: {
		filters: FiltersState;
		setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
	}) => React.ReactNode;
	urlStateKey?: string;
	enableUrlState?: boolean;
}

export function UniversalDataTableWrapper<T extends UniversalTableRow>({
	children,
	urlStateKey = "filters",
	enableUrlState = true,
	defaultFilters = [],
	...config
}: UniversalDataTableWrapperProps<T>) {
	const [filters, setFilters] = useQueryState<FiltersState>(
		urlStateKey,
		enableUrlState
			? parseAsJson(filtersSchema.parse).withDefault(defaultFilters)
			: {
					parse: () => defaultFilters,
					serialize: () => "",
					history: "replace" as const,
					shallow: false,
				},
	);

	return (
		<>
			{children({
				filters: filters || [],
				setFilters: setFilters as React.Dispatch<
					React.SetStateAction<FiltersState>
				>,
			})}
		</>
	);
}
