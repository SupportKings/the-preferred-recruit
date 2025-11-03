"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

export interface ServerSearchComboboxOption {
	value: string;
	label: string;
	subtitle?: string;
}

interface ServerSearchComboboxProps {
	value?: string;
	onValueChange?: (value: string) => void;
	searchTerm: string;
	onSearchChange: (search: string) => void;
	options: ServerSearchComboboxOption[];
	isLoading?: boolean;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	className?: string;
	disabled?: boolean;
	hasMore?: boolean;
	onLoadMore?: () => void;
	showInitialResults?: boolean;
}

export function ServerSearchCombobox({
	value,
	onValueChange,
	searchTerm,
	onSearchChange,
	options,
	isLoading = false,
	placeholder = "Select option...",
	searchPlaceholder = "Search...",
	emptyText = "No results found.",
	className,
	disabled = false,
	hasMore = false,
	onLoadMore,
	showInitialResults = false,
}: ServerSearchComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const listRef = React.useRef<HTMLDivElement>(null);

	const selectedOption = React.useMemo(
		() => options.find((option) => option.value === value),
		[options, value],
	);

	// Handle scroll for infinite loading
	const handleScroll = React.useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.target as HTMLDivElement;
			const bottom =
				target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

			if (bottom && hasMore && !isLoading && onLoadMore) {
				onLoadMore();
			}
		},
		[hasMore, isLoading, onLoadMore],
	);

	const shouldShowResults = showInitialResults || searchTerm.length > 0;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					disabled={disabled}
				>
					<span className="truncate">
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={searchTerm}
						onValueChange={onSearchChange}
					/>
					<CommandList ref={listRef} onScroll={handleScroll}>
						{!shouldShowResults ? (
							<div className="py-6 text-center text-muted-foreground text-sm">
								Start typing to search...
							</div>
						) : isLoading && options.length === 0 ? (
							<div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Loading...</span>
							</div>
						) : options.length === 0 ? (
							<CommandEmpty>{emptyText}</CommandEmpty>
						) : (
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => {
											onValueChange?.(
												option.value === value ? "" : option.value,
											);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === option.value ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>{option.label}</span>
											{option.subtitle && (
												<span className="text-muted-foreground text-xs">
													{option.subtitle}
												</span>
											)}
										</div>
									</CommandItem>
								))}
								{hasMore && (
									<div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Loading more...</span>
									</div>
								)}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
