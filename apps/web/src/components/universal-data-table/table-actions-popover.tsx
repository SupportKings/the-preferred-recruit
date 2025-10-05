"use client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { MoreHorizontalIcon } from "lucide-react";
import type { RowAction, UniversalTableRow } from "./types";

interface TableActionsPopoverProps<
	T extends UniversalTableRow = UniversalTableRow,
> {
	row: T;
	actions: RowAction<T>[];
}

export function TableActionsPopover<T extends UniversalTableRow>({
	row,
	actions,
}: TableActionsPopoverProps<T>) {
	// Filter out hidden actions
	const visibleActions = actions.filter(
		(action) => !action.hidden || !action.hidden(row),
	);

	if (visibleActions.length === 0) {
		return null;
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<span className="sr-only">Open menu</span>
					<MoreHorizontalIcon className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-1" align="end">
				<div className="flex flex-col">
					{visibleActions.map((action, index) => {
						const isDisabled = action.disabled ? action.disabled(row) : false;
						const Icon = action.icon;

						return (
							<Button
								key={index}
								variant="ghost"
								size="sm"
								className={cn(
									"h-8 justify-start gap-2 px-2 text-left font-normal",
									action.variant === "destructive" &&
										"text-destructive hover:text-destructive",
								)}
								disabled={isDisabled}
								onClick={() => action.onClick(row)}
							>
								{Icon && <Icon className="h-4 w-4" />}
								{action.label}
							</Button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
