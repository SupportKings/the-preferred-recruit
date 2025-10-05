import { useEffect, useRef, useState } from "react";

import type { Action } from "kbar";
import { useKBar } from "kbar";
import { type SearchItem, searchItems } from "../data/mockData";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
	timestamp: number;
	results: SearchItem[];
}

export function useDynamicSearch() {
	const [dynamicActions, setDynamicActions] = useState<Action[]>([]);
	const searchCache = useRef<Map<string, CacheEntry>>(new Map());

	const { searchQuery } = useKBar((state) => ({
		searchQuery: state.searchQuery,
	}));

	useEffect(() => {
		if (!searchQuery) {
			setDynamicActions([]);
			return;
		}

		const performSearch = async () => {
			const now = Date.now();
			const cachedEntry = searchCache.current.get(searchQuery);
			const isExpired = cachedEntry
				? now - cachedEntry.timestamp > CACHE_TTL
				: true;

			let results: SearchItem[];

			if (!cachedEntry || isExpired) {
				// Perform search
				results = await searchItems(searchQuery);

				// Update cache
				searchCache.current.set(searchQuery, {
					timestamp: now,
					results,
				});
			} else {
				results = cachedEntry.results;
			}

			// Convert search results to kbar actions
			const actions: Action[] = results.map((item) => ({
				id: item.id,
				name: item.title,
				subtitle: item.description,
				section: "Search Results",
				perform: () => {
					if (item.url) {
						window.location.href = item.url;
					}
				},
				keywords: item.type,
				icon: getIconForType(item.type),
			}));

			setDynamicActions(actions);
		};

		performSearch();
	}, [searchQuery]);

	return dynamicActions;
}

function getIconForType(type: SearchItem["type"]) {
	switch (type) {
		case "document":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			);
		case "user":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			);
		case "project":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
					/>
				</svg>
			);
		case "task":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
			);
		default:
			return null;
	}
}
