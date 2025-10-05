"use client";

import {
	KBarAnimator,
	KBarPortal,
	KBarPositioner,
	KBarResults,
	KBarSearch,
	useMatches,
} from "kbar";
import { SearchActions } from "./SearchActions";

function RenderResults() {
	const { results, rootActionId } = useMatches();

	// Helper to get parent action name
	const getParentName = (item: any) => {
		if (!item.parent) return null;

		// Define static parent names mapping since we can't easily access all actions here
		const parentNames: Record<string, string> = {
			"account-settings": "Account Settings",
			"workspace-settings": "Workspace Settings",
			theme: "Change theme",
		};

		return parentNames[item.parent] || null;
	};

	return (
		<KBarResults
			items={results}
			onRender={({ item, active }) =>
				typeof item === "string" ? (
					<div className="bg-transparent px-3 py-2 text-[lch(40.714_1_139.088)] text-xs uppercase tracking-wider dark:text-[lch(61.683_1_272)]">
						{item}
					</div>
				) : (
					<div
						className={`flex cursor-pointer items-center justify-between rounded px-3 py-3 transition-colors ${
							active
								? "bg-[lch(97.714_0_142.924)] text-[lch(10.357_0_142.924)] dark:bg-[#1E1F23] dark:text-[lch(100_0_272)]"
								: "text-[lch(10.357_0_142.924)] hover:bg-[lch(97.714_0_142.924)] dark:text-[lch(100_0_286.548)] dark:hover:bg-[#1E1F23]"
						}`}
					>
						<div className="flex items-center gap-2">
							{item.icon && (
								<div
									className={`flex items-center justify-center transition-colors ${
										active
											? "text-[lch(10.357_0_142.924)] dark:text-[lch(100_0_272)]"
											: "text-[lch(40.714_1_139.088)] dark:text-[lch(61.683_1_272)]"
									}`}
								>
									{item.icon}
								</div>
							)}
							<div>
								<div className="flex items-center gap-1">
									{getParentName(item) && (
										<>
											<span className="text-[13px] text-[lch(40.714_1_139.088)] dark:text-[lch(61.683_1_272)]">
												{getParentName(item)}
											</span>
											<span className="text-[13px] text-[lch(40.714_1_139.088)] dark:text-[lch(61.683_1_272)]">
												›
											</span>
										</>
									)}
									<span className="font-medium text-[13px]">{item.name}</span>
								</div>
								{item.subtitle && (
									<div className="text-[lch(40.714_1_139.088)] text-sm dark:text-[lch(61.683_1_272)]">
										{item.subtitle}
									</div>
								)}
							</div>
						</div>
						{item.shortcut?.length && (
							<div className="flex gap-1">
								{item.shortcut.map((sc) => (
									<kbd
										key={sc}
										className="rounded border border-[lch(89.333_3.518_282.501)] bg-[lch(89.333_3.518_282.501)] px-2 py-1 text-[lch(10.357_0_142.924)] text-xs dark:border-[lch(19_3.54_272)] dark:bg-[lch(19_3.54_272)] dark:text-[lch(100_0_272)]"
									>
										{sc}
									</kbd>
								))}
							</div>
						)}
					</div>
				)
			}
		/>
	);
}

export function CommandBar() {
	return (
		<KBarPortal>
			<KBarPositioner className="fixed inset-0 z-50">
				<KBarAnimator className="mx-auto mt-16 w-[720px]">
					<div className="overflow-hidden rounded border border-[lch(89.333_3.518_282.501)] bg-white shadow-lg dark:border-[lch(19_3.54_272)] dark:bg-[#1a1b1e]">
						<SearchActions />
						<KBarSearch className="w-full border-none bg-transparent px-4 py-3 text-[lch(10.357_0_142.924)] text-sm outline-none placeholder:text-[lch(40.714_1_139.088)] focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0 dark:text-[lch(100_0_272)] dark:placeholder:text-[lch(61.683_1_272)]" />
						<div className="overflow-hidden border-[lch(89.333_3.518_282.501)] border-t py-[4px] pl-[6px] dark:border-[lch(19_3.54_272)]">
							<RenderResults />
						</div>
					</div>
				</KBarAnimator>
			</KBarPositioner>
		</KBarPortal>
	);
}
