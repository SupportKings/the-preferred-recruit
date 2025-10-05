"use client";

import { useRegisterActions } from "kbar";
import { useDynamicSearch } from "../hooks/useDynamicSearch";

export function SearchActions() {
	const dynamicActions = useDynamicSearch();

	// Register dynamic actions with kbar
	useRegisterActions(dynamicActions, [dynamicActions]);

	return null;
}
