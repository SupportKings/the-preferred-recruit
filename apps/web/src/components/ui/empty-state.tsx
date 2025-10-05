"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
	className?: string;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
	className = "",
}: EmptyStateProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center px-4 py-16 text-center ${className}`}
		>
			<div className="mb-6 rounded-full bg-muted/30 p-4">
				<Icon className="h-12 w-12 text-muted-foreground" />
			</div>

			<h3 className="mb-2 font-semibold text-foreground text-xl">{title}</h3>

			<p className="mb-6 max-w-sm text-muted-foreground">{description}</p>

			{actionLabel && onAction && (
				<div>
					<Button onClick={onAction} size="lg">
						{actionLabel}
					</Button>
				</div>
			)}
		</div>
	);
}
