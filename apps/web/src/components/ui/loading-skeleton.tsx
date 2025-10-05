"use client";

import { Skeleton } from "./skeleton";

interface LoadingSkeletonProps {
	type: "table" | "cards" | "list" | "stats";
	count?: number;
	className?: string;
}

export function LoadingSkeleton({
	type,
	count = 5,
	className = "",
}: LoadingSkeletonProps) {
	if (type === "stats") {
		return (
			<div
				className={`fade-in grid animate-in grid-cols-2 gap-4 duration-500 lg:grid-cols-4 ${className}`}
			>
				{Array.from({ length: 4 }, (_, i) => (
					<div
						key={`stats-skeleton-${i}`}
						className="fade-in slide-in-from-bottom-4 animate-in rounded-xl border bg-card p-6 duration-500"
						style={{ animationDelay: `${i * 100}ms` }}
					>
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 rounded-xl" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (type === "cards") {
		return (
			<div
				className={`fade-in grid animate-in grid-cols-1 gap-6 duration-500 md:grid-cols-2 lg:grid-cols-3 ${className}`}
			>
				{Array.from({ length: count }, (_, i) => (
					<div
						key={`cards-skeleton-${i}`}
						className="fade-in slide-in-from-bottom-4 animate-in rounded-xl border bg-card p-6 duration-500"
						style={{ animationDelay: `${i * 100}ms` }}
					>
						<div className="mb-4 flex items-center gap-3">
							<Skeleton className="h-12 w-12 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
						<div className="space-y-3">
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-3/4" />
							<Skeleton className="h-2 w-full" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (type === "table") {
		return (
			<div
				className={`fade-in animate-in rounded-xl border bg-card duration-500 ${className}`}
			>
				<div className="border-b p-4">
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-8 w-24" />
					</div>
				</div>
				<div className="divide-y">
					{Array.from({ length: count }, (_, i) => (
						<div
							key={`table-skeleton-${i}`}
							className="fade-in slide-in-from-left-4 flex animate-in items-center gap-4 p-4 duration-500"
							style={{ animationDelay: `${i * 100}ms` }}
						>
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-3 w-32" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-6 w-16 rounded-full" />
								<Skeleton className="h-8 w-8 rounded" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (type === "list") {
		return (
			<div className={`fade-in animate-in space-y-4 duration-500 ${className}`}>
				{Array.from({ length: count }, (_, i) => (
					<div
						key={`list-skeleton-${i}`}
						className="fade-in slide-in-from-bottom-4 flex animate-in items-center gap-4 rounded-lg border bg-card p-4 duration-500"
						style={{ animationDelay: `${i * 100}ms` }}
					>
						<Skeleton className="h-6 w-6 rounded" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
						<Skeleton className="h-8 w-20" />
					</div>
				))}
			</div>
		);
	}

	return null;
}

export function PulseLoader({ className = "" }: { className?: string }) {
	return (
		<div
			className={`inline-block h-4 w-4 animate-pulse rounded-full bg-primary ${className}`}
		/>
	);
}
