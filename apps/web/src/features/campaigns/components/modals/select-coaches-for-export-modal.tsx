"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DataTableFilter } from "@/components/data-table-filter";
import type {
	ColumnConfig,
	FiltersState,
} from "@/components/data-table-filter/core/types";
import { useDataTableFilters } from "@/components/data-table-filter/hooks/use-data-table-filters";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	BarChartIcon,
	Building2Icon,
	DollarSignIcon,
	FlagIcon,
	GraduationCapIcon,
	Loader2,
	MapPinIcon,
	PlusIcon,
	TrophyIcon,
	X,
	XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getCampaignCoachesAction } from "../../actions/getCampaignCoaches";
import {
	type CoachFilterOptions,
	getCampaignCoachFilterOptionsAction,
} from "../../actions/getCampaignCoachFilterOptions";
import type {
	CampaignCoachData,
	CoachExportServerFilters,
	CoachSelectionResult,
} from "../../types/coach-export-types";
import { coachExportColumns } from "../table-columns/coach-export-columns";

// Helper to convert FiltersState to server format
function convertFiltersToServerFormat(
	filters: FiltersState,
): CoachExportServerFilters {
	const serverFilters: CoachExportServerFilters = {};

	for (const filter of filters) {
		switch (filter.columnId) {
			case "division":
				serverFilters.divisions = {
					values: filter.values as string[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is any of"
						| "is none of",
				};
				break;
			case "university":
				serverFilters.universities = {
					values: filter.values as string[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is any of"
						| "is none of",
				};
				break;
			case "program":
				serverFilters.programs = {
					values: filter.values as string[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is any of"
						| "is none of",
				};
				break;
			case "tuition":
				serverFilters.tuition = {
					values: filter.values as number[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is between"
						| "is not between"
						| "is less than"
						| "is less than or equal to"
						| "is greater than"
						| "is greater than or equal to",
				};
				break;
			case "state":
				serverFilters.states = {
					values: filter.values as string[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is any of"
						| "is none of",
				};
				break;
			case "conference":
				serverFilters.conferences = {
					values: filter.values as string[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is any of"
						| "is none of",
				};
				break;
			case "institutionFlags":
				serverFilters.institutionFlags = {
					values: filter.values as string[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is any of"
						| "is none of",
				};
				break;
			case "usNewsNational":
				serverFilters.usNewsNational = {
					values: filter.values as number[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is between"
						| "is not between"
						| "is less than"
						| "is less than or equal to"
						| "is greater than"
						| "is greater than or equal to",
				};
				break;
			case "usNewsLiberalArts":
				serverFilters.usNewsLiberalArts = {
					values: filter.values as number[],
					operator: filter.operator as
						| "is"
						| "is not"
						| "is between"
						| "is not between"
						| "is less than"
						| "is less than or equal to"
						| "is greater than"
						| "is greater than or equal to",
				};
				break;
		}
	}

	return serverFilters;
}

// Type for coach data used by filter column helper
interface CoachFilterData {
	division: string | null;
	university: string | null;
	program: string | null;
	tuition: number | null;
	state: string | null;
	conference: string | null;
	institutionFlags: string | null;
	usNewsNational: number | null;
	usNewsLiberalArts: number | null;
}

interface SelectCoachesForExportModalProps {
	campaignId: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onConfirm: (result: CoachSelectionResult) => void;
	initialSelectedCoaches?: CampaignCoachData[];
	children?: React.ReactNode;
}

// Column helper for filter configuration
const universalColumnHelper = createUniversalColumnHelper<CoachFilterData>();

export function SelectCoachesForExportModal({
	campaignId,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	onConfirm,
	initialSelectedCoaches = [],
}: SelectCoachesForExportModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [coaches, setCoaches] = useState<CampaignCoachData[]>([]);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	// Cache of all selected coaches across pages (keyed by coachId)
	const [selectedCoachesCache, setSelectedCoachesCache] = useState<
		Map<string, CampaignCoachData>
	>(new Map());
	const [filterOptions, setFilterOptions] = useState<CoachFilterOptions>({
		divisions: [],
		universities: [],
		programs: [],
		states: [],
		conferences: [],
		institutionTypes: [],
	});
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 50,
		totalCount: 0,
		totalPages: 0,
	});

	// State for "select all coaches matching filters" mode
	const [selectAllFiltered, setSelectAllFiltered] = useState(false);

	// Use external state if provided, otherwise use internal
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	// Filters state using FiltersState format
	const [filters, setFilters] = useState<FiltersState>([]);

	// Track if we've done the initial load for this modal session
	const hasInitiallyLoaded = useRef(false);

	// Get selected university IDs from current filters for conditional program filter
	const selectedUniversityIds = useMemo(() => {
		const universityFilter = filters.find((f) => f.columnId === "university");
		if (!universityFilter || universityFilter.values.length === 0) {
			return [];
		}
		return universityFilter.values as string[];
	}, [filters]);

	// Build filter column configuration dynamically
	const filterColumnsConfig = useMemo(() => {
		// Build facetedOptions maps for counts
		const divisionFacetedOptions = new Map<string, number>();
		for (const div of filterOptions.divisions) {
			divisionFacetedOptions.set(div.name, div.count);
		}

		const universityFacetedOptions = new Map<string, number>();
		for (const uni of filterOptions.universities) {
			universityFacetedOptions.set(uni.id, uni.count);
		}

		const baseConfig: ColumnConfig<CoachFilterData>[] = [
			{
				...universalColumnHelper
					.option("division")
					.displayName("Division")
					.icon(TrophyIcon)
					.build(),
				options: filterOptions.divisions.map((div) => ({
					value: div.name,
					label: div.name,
				})),
				facetedOptions: divisionFacetedOptions,
			},
			{
				...universalColumnHelper
					.option("university")
					.displayName("Universities")
					.icon(Building2Icon)
					.build(),
				options: filterOptions.universities.map((uni) => ({
					value: uni.id,
					label: uni.name,
				})),
				facetedOptions: universityFacetedOptions,
			},
		];

		// Only add programs filter if universities are selected
		if (selectedUniversityIds.length > 0) {
			const filteredPrograms = filterOptions.programs.filter((prog) =>
				selectedUniversityIds.includes(prog.universityId),
			);

			const programFacetedOptions = new Map<string, number>();
			for (const prog of filteredPrograms) {
				programFacetedOptions.set(prog.id, prog.count);
			}

			baseConfig.push({
				...universalColumnHelper
					.option("program")
					.displayName("Programs")
					.icon(GraduationCapIcon)
					.build(),
				options: filteredPrograms.map((prog) => ({
					value: prog.id,
					label: prog.name,
				})),
				facetedOptions: programFacetedOptions,
			});
		}

		// Add tuition budget filter
		baseConfig.push(
			universalColumnHelper
				.number("tuition")
				.displayName("Tuition Budget")
				.icon(DollarSignIcon)
				.build(),
		);

		// Add state filter
		const stateFacetedOptions = new Map<string, number>();
		for (const state of filterOptions.states) {
			stateFacetedOptions.set(state.name, state.count);
		}
		baseConfig.push({
			...universalColumnHelper
				.option("state")
				.displayName("State")
				.icon(MapPinIcon)
				.build(),
			options: filterOptions.states.map((state) => ({
				value: state.name,
				label: state.name,
			})),
			facetedOptions: stateFacetedOptions,
		});

		// Add conference filter
		const conferenceFacetedOptions = new Map<string, number>();
		for (const conf of filterOptions.conferences) {
			conferenceFacetedOptions.set(conf.id, conf.count);
		}
		baseConfig.push({
			...universalColumnHelper
				.option("conference")
				.displayName("Conference")
				.icon(TrophyIcon)
				.build(),
			options: filterOptions.conferences.map((conf) => ({
				value: conf.id,
				label: conf.name,
			})),
			facetedOptions: conferenceFacetedOptions,
		});

		// Add institution type filter (option filter with dynamic values)
		const institutionTypeFacetedOptions = new Map<string, number>();
		for (const instType of filterOptions.institutionTypes) {
			institutionTypeFacetedOptions.set(instType.name, instType.count);
		}
		baseConfig.push({
			...universalColumnHelper
				.option("institutionFlags")
				.displayName("Institution Type")
				.icon(FlagIcon)
				.build(),
			options: filterOptions.institutionTypes.map((instType) => ({
				value: instType.name,
				label: instType.name,
			})),
			facetedOptions: institutionTypeFacetedOptions,
		});

		// Add US News National ranking filter
		baseConfig.push(
			universalColumnHelper
				.number("usNewsNational")
				.displayName("US News (National)")
				.icon(BarChartIcon)
				.build(),
		);

		// Add US News Liberal Arts ranking filter
		baseConfig.push(
			universalColumnHelper
				.number("usNewsLiberalArts")
				.displayName("US News (Liberal Arts)")
				.icon(BarChartIcon)
				.build(),
		);

		return baseConfig;
	}, [filterOptions, selectedUniversityIds]);

	// Use the data table filters hook
	const {
		columns: filterColumns,
		filters: filterState,
		actions: filterActions,
		strategy,
	} = useDataTableFilters({
		strategy: "server" as const,
		data: [] as CoachFilterData[],
		columnsConfig: filterColumnsConfig,
		filters,
		onFiltersChange: setFilters,
	});

	const loadFilterOptions = useCallback(
		async (currentFilters?: FiltersState) => {
			try {
				const serverFilters = currentFilters
					? convertFiltersToServerFormat(currentFilters)
					: undefined;
				const result = await getCampaignCoachFilterOptionsAction(serverFilters);
				if (result.success && result.data) {
					setFilterOptions(result.data);
				}
			} catch (error) {
				console.error("Error loading filter options:", error);
			}
		},
		[],
	);

	const loadCoaches = useCallback(
		async (currentFilters: FiltersState, page = 1, newPageSize?: number) => {
			const effectivePageSize = newPageSize ?? pagination.pageSize;
			try {
				setIsLoading(true);
				const serverFilters = convertFiltersToServerFormat(currentFilters);
				const result = await getCampaignCoachesAction(campaignId, {
					page,
					pageSize: effectivePageSize,
					filters: serverFilters,
				});

				if (result.success && result.data) {
					setCoaches(result.data);
					if (result.pagination) {
						setPagination(result.pagination);
					}
				} else {
					toast.error(result.error || "Failed to load coaches");
				}
			} catch (error) {
				console.error("Error loading coaches:", error);
				toast.error("Failed to load coaches");
			} finally {
				setIsLoading(false);
			}
		},
		[campaignId, pagination.pageSize],
	);

	const handlePageSizeChange = (newSize: string) => {
		const size = Number.parseInt(newSize, 10);
		setPagination((prev) => ({ ...prev, pageSize: size, page: 1 }));
		loadCoaches(filters, 1, size);
	};

	// Load filter options and initial data when modal opens
	useEffect(() => {
		if (open && !hasInitiallyLoaded.current) {
			hasInitiallyLoaded.current = true;
			setIsLoading(true);
			loadFilterOptions();
			loadCoaches(filters, 1);
		}
		// Reset when modal closes
		if (!open) {
			hasInitiallyLoaded.current = false;
		}
	}, [open, loadFilterOptions, loadCoaches, filters]);

	// Set initial selection based on initialSelectedCoaches
	useEffect(() => {
		if (open && initialSelectedCoaches.length > 0) {
			const newSelection: Record<string, boolean> = {};
			const newCache = new Map<string, CampaignCoachData>();
			for (const coach of initialSelectedCoaches) {
				newSelection[coach.coachId] = true;
				newCache.set(coach.coachId, coach);
			}
			setRowSelection(newSelection);
			setSelectedCoachesCache(newCache);
		}
	}, [open, initialSelectedCoaches]);

	// Sync selected coaches cache with row selection changes
	useEffect(() => {
		setSelectedCoachesCache((prevCache) => {
			const newCache = new Map(prevCache);

			// Add newly selected coaches from current page
			for (const coach of coaches) {
				if (rowSelection[coach.coachId]) {
					newCache.set(coach.coachId, coach);
				} else {
					newCache.delete(coach.coachId);
				}
			}

			// Remove any cached coaches that are no longer in rowSelection
			for (const coachId of newCache.keys()) {
				if (!rowSelection[coachId]) {
					newCache.delete(coachId);
				}
			}

			return newCache;
		});
	}, [rowSelection, coaches]);

	// Track filter changes and reload data + filter options
	const previousFiltersRef = useRef<string>("");
	useEffect(() => {
		const filtersJson = JSON.stringify(filters);
		if (
			previousFiltersRef.current &&
			previousFiltersRef.current !== filtersJson
		) {
			loadCoaches(filters, 1);
			// Also refresh filter options to update counts based on current filters
			loadFilterOptions(filters);
			// Reset "select all" mode when filters change
			setSelectAllFiltered(false);
		}
		previousFiltersRef.current = filtersJson;
	}, [filters, loadCoaches, loadFilterOptions]);

	// Table instance with server-side pagination
	const table = useReactTable({
		data: coaches,
		columns: coachExportColumns,
		getRowId: (row) => row.coachId,
		state: {
			rowSelection,
			pagination: {
				pageIndex: pagination.page - 1,
				pageSize: pagination.pageSize,
			},
		},
		manualPagination: true,
		pageCount: pagination.totalPages,
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: (updater) => {
			const newState =
				typeof updater === "function"
					? updater({
							pageIndex: pagination.page - 1,
							pageSize: pagination.pageSize,
						})
					: updater;

			// Check if page size changed
			if (newState.pageSize !== pagination.pageSize) {
				setPagination((prev) => ({
					...prev,
					pageSize: newState.pageSize,
					page: 1,
				}));
				loadCoaches(filters, 1, newState.pageSize);
			} else {
				loadCoaches(filters, newState.pageIndex + 1);
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	// Get all selected coaches from cache (works across pages)
	const selectedCoaches = useMemo(
		() => Array.from(selectedCoachesCache.values()),
		[selectedCoachesCache],
	);

	// Calculate effective selected count (accounts for selectAll mode)
	const effectiveSelectedCount = selectAllFiltered
		? pagination.totalCount
		: selectedCoaches.length;

	const handleConfirm = () => {
		if (selectAllFiltered) {
			// Select all mode - pass filters to parent
			onConfirm({
				selectAll: true,
				filters: convertFiltersToServerFormat(filters),
				count: pagination.totalCount,
			});
		} else {
			// Individual selection mode
			if (selectedCoaches.length === 0) {
				toast.error("Please select at least one coach");
				return;
			}
			onConfirm({
				selectAll: false,
				coaches: selectedCoaches,
			});
		}

		setOpen(false);
		setRowSelection({});
		setSelectedCoachesCache(new Map());
		setSelectAllFiltered(false);
	};

	const handleClearSelection = () => {
		setRowSelection({});
		setSelectedCoachesCache(new Map());
		setSelectAllFiltered(false);
	};

	const handleRowClick = (coach: CampaignCoachData) => {
		setRowSelection((prev) => {
			const isSelected = prev[coach.coachId];
			if (isSelected) {
				const next = { ...prev };
				delete next[coach.coachId];
				return next;
			}
			return { ...prev, [coach.coachId]: true };
		});
	};

	if (!open) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogPortal>
				<DialogOverlay className="bg-black/80" />
				<DialogContent
					nested
					className="z-50! flex h-[90vh] w-[95vw] max-w-[95vw] flex-col gap-4 overflow-hidden p-6 sm:max-w-[95vw]"
					showCloseButton={false}
				>
					<DialogTitle className="sr-only">
						Select Coaches for Export
					</DialogTitle>
					{/* Header */}
					<div className="flex items-start justify-between">
						<div>
							<h2 className="font-semibold text-lg">
								Select Coaches for Export
							</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								Filter and select coaches to include in your CSV export
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={() => setOpen(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<Separator />

					{/* Content */}
					<div className="flex min-h-0 flex-1 flex-col gap-4">
						{/* Filters Section */}
						<DataTableFilter
							columns={filterColumns}
							filters={filterState}
							actions={filterActions}
							strategy={strategy}
						/>

						<Separator />

						{/* Table Section */}
						<div className="flex min-h-0 flex-1 flex-col gap-2">
							<div className="flex items-center justify-between">
								<Label className="text-sm">
									Available Coaches ({pagination.totalCount})
								</Label>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground text-xs">Show</span>
										<Select
											value={pagination.pageSize.toString()}
											onValueChange={handlePageSizeChange}
										>
											<SelectTrigger className="h-6! min-h-0 w-[60px] px-2 py-0">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="10">10</SelectItem>
												<SelectItem value="25">25</SelectItem>
												<SelectItem value="50">50</SelectItem>
												<SelectItem value="100">100</SelectItem>
											</SelectContent>
										</Select>
										<span className="text-muted-foreground text-xs">
											per page
										</span>
									</div>
									<div className="text-muted-foreground text-xs">
										{selectAllFiltered
											? `All ${effectiveSelectedCount.toLocaleString()} selected`
											: `${effectiveSelectedCount} selected`}
									</div>
								</div>
							</div>

							{/* Pagination - Fixed above scrollable table */}
							<div className="flex items-center justify-between px-1 py-2 text-muted-foreground text-xs tabular-nums">
								<span>
									Page {pagination.page} of {pagination.totalPages} • Total:{" "}
									{pagination.totalCount}
								</span>
								<div className="flex items-center gap-1">
									<Button
										variant="outline"
										size="sm"
										className="h-6 px-2 text-xs"
										onClick={() => table.setPageIndex(0)}
										disabled={!table.getCanPreviousPage()}
									>
										First
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="h-6 px-2 text-xs"
										onClick={() => table.previousPage()}
										disabled={!table.getCanPreviousPage()}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="h-6 px-2 text-xs"
										onClick={() => table.nextPage()}
										disabled={!table.getCanNextPage()}
									>
										Next
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="h-6 px-2 text-xs"
										onClick={() => table.setPageIndex(table.getPageCount() - 1)}
										disabled={!table.getCanNextPage()}
									>
										Last
									</Button>
								</div>
							</div>

							{/* Select All Banner - shows when all current page rows are selected */}
							{table.getIsAllPageRowsSelected() &&
								!selectAllFiltered &&
								pagination.totalCount > coaches.length && (
									<div className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-950">
										<span>
											All {coaches.length} coaches on this page are selected.
										</span>
										<Button
											variant="link"
											size="sm"
											className="h-auto p-0 text-blue-600 dark:text-blue-400"
											onClick={() => setSelectAllFiltered(true)}
										>
											Select all {pagination.totalCount.toLocaleString()}{" "}
											coaches matching your filters
										</Button>
									</div>
								)}

							{/* Select All Active Indicator */}
							{selectAllFiltered && (
								<div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950">
									<span>
										All {pagination.totalCount.toLocaleString()} coaches
										matching your filters are selected.
									</span>
									<Button
										variant="link"
										size="sm"
										className="h-auto p-0"
										onClick={handleClearSelection}
									>
										Clear selection
									</Button>
								</div>
							)}

							<div className="min-h-0 flex-1 overflow-auto">
								{isLoading ? (
									<div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2">
										<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
										<p className="text-muted-foreground text-sm">
											Loading coaches...
										</p>
									</div>
								) : (
									<UniversalDataTable
										table={table}
										emptyStateMessage="No coaches found"
										totalCount={pagination.totalCount}
										onRowClick={handleRowClick}
										hidePagination
									/>
								)}
							</div>
						</div>

						{/* Selected Coaches Preview - Compact */}
						{(selectAllFiltered || selectedCoaches.length > 0) && (
							<div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/50 p-2">
								<span className="font-medium text-muted-foreground text-xs">
									Selected ({effectiveSelectedCount.toLocaleString()}):
								</span>
								{selectAllFiltered ? (
									<span className="text-xs">
										All coaches matching current filters
									</span>
								) : (
									<>
										{selectedCoaches.slice(0, 12).map((coach) => (
											<div
												key={coach.coachId}
												className="flex items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-xs"
											>
												<span className="max-w-[100px] truncate">
													{coach.coachName}
												</span>
												<button
													type="button"
													onClick={() => {
														setRowSelection((prev) => {
															const next = { ...prev };
															delete next[coach.coachId];
															return next;
														});
													}}
													className="rounded-sm opacity-70 hover:opacity-100"
												>
													<XIcon className="h-3 w-3" />
												</button>
											</div>
										))}
										{selectedCoaches.length > 12 && (
											<span className="text-muted-foreground text-xs">
												+{selectedCoaches.length - 12} more
											</span>
										)}
									</>
								)}
							</div>
						)}
					</div>

					<Separator />

					{/* Footer */}
					<div className="flex items-center justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						{(selectAllFiltered || selectedCoaches.length > 0) && (
							<Button
								type="button"
								variant="ghost"
								onClick={handleClearSelection}
							>
								Clear Selection
							</Button>
						)}
						<Button
							type="button"
							onClick={handleConfirm}
							disabled={effectiveSelectedCount === 0}
						>
							<PlusIcon className="mr-2 h-4 w-4" />
							Confirm Selection ({effectiveSelectedCount.toLocaleString()})
						</Button>
					</div>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
}
