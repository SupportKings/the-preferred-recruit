import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { FilterIcon } from "lucide-react";

export interface TableSkeletonProps {
	numCols: number;
	numRows: number;
}

export function UniversalTableSkeleton({
	numRows,
	numCols,
}: TableSkeletonProps) {
	const rows = Array.from(Array(numRows).keys());
	// Always add 1 column for actions
	const cols = Array.from(Array(numCols + 1).keys());

	return (
		<>
			{/* Pagination skeleton at top */}
			<div className="flex items-center justify-between py-4">
				<div className="flex-1 text-muted-foreground text-sm tabular-nums">
					<Skeleton className="h-[20px] w-[200px]" />
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" disabled>
						First
					</Button>
					<Button variant="outline" size="sm" disabled>
						Previous
					</Button>
					<Button variant="outline" size="sm" disabled>
						Next
					</Button>
					<Button variant="outline" size="sm" disabled>
						Last
					</Button>
				</div>
			</div>

			{/* Table skeleton */}
			<div className="rounded-md border bg-white dark:bg-inherit">
				<Table>
					<TableHeader>
						<TableRow>
							{cols.map((_, index) => (
								<TableHead key={index}>
									<Skeleton className="h-[20px] w-[75px]" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((_, index) => (
							<TableRow key={index} className="h-12">
								{cols.map((_, index2) => (
									<TableCell key={index2} className="h-12">
										<Skeleton className="h-[30px] w-[140px]" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	);
}

export function UniversalTableFilterSkeleton() {
	return (
		<div className="flex items-center gap-2">
			<Button variant="outline" className="h-7" disabled>
				<FilterIcon className="size-4" />
				<span>Filter</span>
			</Button>
			<Skeleton className="h-7 w-20" />
			<Skeleton className="h-7 w-24" />
		</div>
	);
}

export function UniversalTableFallback({
	numCols,
	numRows = 10,
}: {
	numCols: number;
	numRows?: number;
}) {
	return (
		<div className="w-full space-y-4">
			<div className="flex items-center gap-2 pb-4">
				<UniversalTableFilterSkeleton />
			</div>
			<UniversalTableSkeleton numCols={numCols} numRows={numRows} />
		</div>
	);
}
