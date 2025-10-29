"use client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import type { RowAction, UniversalTableRow } from "./types";

interface TableActionsInlineProps<
	T extends UniversalTableRow = UniversalTableRow,
> {
	row: T;
	actions: RowAction<T>[];
}

export function TableActionsInline<T extends UniversalTableRow>({
	row,
	actions,
}: TableActionsInlineProps<T>) {
	// Filter out hidden actions
	const visibleActions = actions.filter(
		(action) => !action.hidden || !action.hidden(row),
	);

	if (visibleActions.length === 0) {
		return null;
	}

	return (
		<TooltipProvider>
			<div className="flex items-center justify-end gap-1">
				{visibleActions.map((action) => {
					const isDisabled = action.disabled ? action.disabled(row) : false;
					const Icon = action.icon;

					return (
						<Tooltip key={action.label}>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className={cn(
										"h-8 w-8 p-0",
										action.variant === "destructive" &&
											"text-destructive hover:text-destructive",
									)}
									disabled={isDisabled}
									onClick={() => action.onClick(row)}
								>
									<span className="sr-only">{action.label}</span>
									{Icon && <Icon className="h-4 w-4" />}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{action.label}</p>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</TooltipProvider>
	);
}
