"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { CheckIcon, Loader2, PlusIcon, X, XIcon } from "lucide-react";
import { toast } from "sonner";
import { getCampaignCoachesAction } from "../../actions/getCampaignCoaches";
import {
	type CoachFilterOptions,
	getCampaignCoachFilterOptionsAction,
} from "../../actions/getCampaignCoachFilterOptions";
import type {
	CampaignCoachData,
	CoachExportFilters,
} from "../../types/coach-export-types";
import { coachExportColumns } from "../table-columns/coach-export-columns";

interface SelectCoachesForExportModalProps {
	campaignId: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onConfirm: (coaches: CampaignCoachData[]) => void;
	initialSelectedCoaches?: CampaignCoachData[];
	children?: React.ReactNode;
}

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
	const [rowSelection, setRowSelection] = useState({});
	const [filterOptions, setFilterOptions] = useState<CoachFilterOptions>({
		divisions: [],
		universities: [],
		programs: [],
	});
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 50,
		totalCount: 0,
		totalPages: 0,
	});

	// Use external state if provided, otherwise use internal
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;

	// Filters state
	const [filters, setFilters] = useState<CoachExportFilters>({
		divisions: [],
		universities: [],
		programs: [],
		minTuition: undefined,
		maxTuition: undefined,
	});

	const loadFilterOptions = useCallback(async () => {
		try {
			const result = await getCampaignCoachFilterOptionsAction();
			if (result.success && result.data) {
				setFilterOptions(result.data);
			}
		} catch (error) {
			console.error("Error loading filter options:", error);
		}
	}, []);

	const loadCoaches = useCallback(
		async (page = 1) => {
			try {
				setIsLoading(true);
				const result = await getCampaignCoachesAction(campaignId, {
					page,
					pageSize: pagination.pageSize,
					filters,
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
		[campaignId, filters, pagination.pageSize],
	);

	// Load filter options when modal opens
	useEffect(() => {
		if (open) {
			loadFilterOptions();
			loadCoaches();
		}
	}, [open, loadFilterOptions, loadCoaches]);

	// Set initial selection based on initialSelectedCoaches
	useEffect(() => {
		if (open && coaches.length > 0 && initialSelectedCoaches.length > 0) {
			const initialSelectedIds = new Set(
				initialSelectedCoaches.map((c) => c.coachId),
			);
			const newSelection: Record<string, boolean> = {};
			coaches.forEach((coach, index) => {
				if (initialSelectedIds.has(coach.coachId)) {
					newSelection[index.toString()] = true;
				}
			});
			setRowSelection(newSelection);
		}
	}, [open, coaches, initialSelectedCoaches]);

	// Apply filters
	const handleApplyFilters = () => {
		loadCoaches(1); // Reset to first page when applying filters
	};

	// Table instance with server-side pagination
	const table = useReactTable({
		data: coaches,
		columns: coachExportColumns,
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
			loadCoaches(newState.pageIndex + 1);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedCoaches = selectedRows.map((row) => row.original);

	const handleConfirm = () => {
		if (selectedCoaches.length === 0) {
			toast.error("Please select at least one coach");
			return;
		}

		onConfirm(selectedCoaches);
		setOpen(false);
		setRowSelection({}); // Reset selection
	};

	const handleClearSelection = () => {
		table.toggleAllRowsSelected(false);
	};

	const handleClearFilters = () => {
		setFilters({
			divisions: [],
			universities: [],
			programs: [],
			minTuition: undefined,
			maxTuition: undefined,
		});
		loadCoaches(1); // Reset to first page
	};

	if (!open) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogPortal>
				<DialogOverlay className="fixed inset-0 z-50 bg-black/80" />
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="relative flex h-[90vh] w-[95vw] flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg">
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
						<div className="flex flex-1 flex-col gap-4 overflow-hidden">
							{/* Filters Section */}
							<div className="flex flex-wrap items-center gap-2">
								{/* Division Filter */}
								<FacetedFilter
									title="Division"
									options={filterOptions.divisions.map((div) => ({
										value: div,
										label: div,
									}))}
									selectedValues={filters.divisions || []}
									onSelect={(values) =>
										setFilters({ ...filters, divisions: values })
									}
								/>

								{/* Universities Filter */}
								<FacetedFilter
									title="Universities"
									options={filterOptions.universities.map((uni) => ({
										value: uni.id,
										label: uni.name,
									}))}
									selectedValues={filters.universities || []}
									onSelect={(values) =>
										setFilters({ ...filters, universities: values })
									}
								/>

								{/* Programs Filter - only shows when universities are selected */}
								{filters.universities && filters.universities.length > 0 && (
									<FacetedFilter
										title="Programs"
										options={filterOptions.programs
											.filter((prog) =>
												filters.universities?.includes(prog.universityId),
											)
											.map((prog) => ({
												value: prog.id,
												label: prog.name,
											}))}
										selectedValues={filters.programs || []}
										onSelect={(values) =>
											setFilters({ ...filters, programs: values })
										}
									/>
								)}

								<div className="ml-auto flex gap-2">
									{filters.divisions?.length ||
									filters.universities?.length ||
									filters.programs?.length ? (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleClearFilters}
										>
											Clear Filters
										</Button>
									) : null}
									<Button
										size="sm"
										variant="outline"
										onClick={handleApplyFilters}
										disabled={isLoading}
									>
										{isLoading && (
											<Loader2 className="mr-2 h-3 w-3 animate-spin" />
										)}
										Apply Filters
									</Button>
								</div>
							</div>

							<Separator />

							{/* Table Section */}
							<div className="flex flex-1 flex-col gap-2 overflow-hidden">
								<div className="flex items-center justify-between">
									<Label className="text-sm">
										Available Coaches ({pagination.totalCount})
									</Label>
									<div className="text-muted-foreground text-xs">
										{selectedCoaches.length} selected
									</div>
								</div>

								<div className="flex-1 overflow-auto rounded-md border-b">
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
										/>
									)}
								</div>
							</div>

							{/* Selected Coaches Preview - Compact */}
							{selectedCoaches.length > 0 && (
								<div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/50 p-2">
									<span className="font-medium text-muted-foreground text-xs">
										Selected ({selectedCoaches.length}):
									</span>
									{selectedCoaches.slice(0, 5).map((coach) => (
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
													const rowIndex = coaches.findIndex(
														(c) => c.coachId === coach.coachId,
													);
													if (rowIndex !== -1) {
														table
															.getRow(rowIndex.toString())
															.toggleSelected(false);
													}
												}}
												className="rounded-sm opacity-70 hover:opacity-100"
											>
												<XIcon className="h-3 w-3" />
											</button>
										</div>
									))}
									{selectedCoaches.length > 5 && (
										<span className="text-muted-foreground text-xs">
											+{selectedCoaches.length - 5} more
										</span>
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
							{selectedCoaches.length > 0 && (
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
								disabled={selectedCoaches.length === 0}
							>
								<PlusIcon className="mr-2 h-4 w-4" />
								Confirm Selection ({selectedCoaches.length})
							</Button>
						</div>
					</div>
				</div>
			</DialogPortal>
		</Dialog>
	);
}

// Faceted filter component matching data table filter style
interface FacetedFilterProps {
	title: string;
	options: Array<{ value: string; label: string }>;
	selectedValues: string[];
	onSelect: (values: string[]) => void;
	maxVisible?: number; // Maximum items to show before search
}

function FacetedFilter({
	title,
	options,
	selectedValues,
	onSelect,
	maxVisible = 100,
}: FacetedFilterProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const handleToggle = (value: string) => {
		const newValues = selectedValues.includes(value)
			? selectedValues.filter((v) => v !== value)
			: [...selectedValues, value];
		onSelect(newValues);
	};

	// Filter options based on search and limit visible items
	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(search.toLowerCase()),
	);
	const visibleOptions = filteredOptions.slice(0, maxVisible);
	const hasMore = filteredOptions.length > maxVisible;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 border-dashed">
					<PlusIcon className="mr-2 h-4 w-4" />
					{title}
					{selectedValues.length > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedValues.length}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.length > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedValues.length} selected
									</Badge>
								) : (
									options
										.filter((option) => selectedValues.includes(option.value))
										.map((option) => (
											<Badge
												variant="secondary"
												key={option.value}
												className="rounded-sm px-1 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[250px] p-0" align="start">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={`Search ${title.toLowerCase()}...`}
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{visibleOptions.map((option) => {
								const isSelected = selectedValues.includes(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={() => handleToggle(option.value)}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className="h-4 w-4" />
										</div>
										<span className="truncate">{option.label}</span>
									</CommandItem>
								);
							})}
							{hasMore && (
								<div className="px-2 py-1.5 text-muted-foreground text-xs">
									Type to search {filteredOptions.length - maxVisible} more...
								</div>
							)}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
