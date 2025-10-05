import type * as React from "react";

import { cn } from "@/lib/utils";

type StatusColorScheme =
	| "green"
	| "red"
	| "yellow"
	| "blue"
	| "purple"
	| "gray"
	| "orange";

const colorSchemes: Record<
	StatusColorScheme,
	{ bg: string; text: string; dot: string }
> = {
	green: {
		bg: "bg-green-50 dark:bg-green-950/50",
		text: "text-green-700 dark:text-green-400",
		dot: "bg-green-500",
	},
	red: {
		bg: "bg-red-50 dark:bg-red-950/50",
		text: "text-red-700 dark:text-red-400",
		dot: "bg-red-500",
	},
	yellow: {
		bg: "bg-yellow-50 dark:bg-yellow-950/50",
		text: "text-yellow-700 dark:text-yellow-400",
		dot: "bg-yellow-500",
	},
	blue: {
		bg: "bg-blue-50 dark:bg-blue-950/50",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500",
	},
	purple: {
		bg: "bg-purple-50 dark:bg-purple-950/50",
		text: "text-purple-700 dark:text-purple-400",
		dot: "bg-purple-500",
	},
	orange: {
		bg: "bg-orange-50 dark:bg-orange-950/50",
		text: "text-orange-700 dark:text-orange-400",
		dot: "bg-orange-500",
	},
	gray: {
		bg: "bg-gray-50 dark:bg-gray-950/50",
		text: "text-gray-700 dark:text-gray-400",
		dot: "bg-gray-500",
	},
};

// Auto-detect color scheme from status string
const detectColorScheme = (
	status: string | null | undefined,
): StatusColorScheme => {
	if (!status) return "gray";

	const normalizedStatus = status.toLowerCase().trim();

	// Success/positive states
	if (
		/(active|completed?|success|granted|approved|done|finished|enabled|online|published|verified)/i.test(
			normalizedStatus,
		)
	) {
		return "green";
	}

	// Error/negative states
	if (
		/(error|failed?|rejected|denied|revoked|expired|churned|cancelled?|deleted|disabled|offline|blocked)/i.test(
			normalizedStatus,
		)
	) {
		return "red";
	}

	// Warning/caution states
	if (
		/(pending|paused|suspended|warning|review|draft|scheduled)/i.test(
			normalizedStatus,
		)
	) {
		return "yellow";
	}

	// Info/process states
	if (
		/(processing|onboard|progress|running|loading|syncing)/i.test(
			normalizedStatus,
		)
	) {
		return "blue";
	}

	// Special/featured states
	if (/(premium|vip|featured|priority|important)/i.test(normalizedStatus)) {
		return "purple";
	}

	// Neutral/waiting states
	if (/(waiting|queued|assigned|new)/i.test(normalizedStatus)) {
		return "orange";
	}

	return "gray";
};

// Capitalize first letter of each word
const capitalizeStatus = (status: string | null | undefined): string => {
	if (!status) return "Unknown";

	return status
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

interface StatusBadgeProps extends React.ComponentProps<"div"> {
	children: string | null | undefined;
	colorScheme?: StatusColorScheme;
	showDot?: boolean;
	className?: string;
}

export function StatusBadge({
	children: status,
	colorScheme,
	showDot = true,
	className,
	...props
}: StatusBadgeProps) {
	const detectedColorScheme = colorScheme || detectColorScheme(status);
	const colors = colorSchemes[detectedColorScheme];
	const displayText = capitalizeStatus(status);

	return (
		<div
			className={cn(
				"inline-flex h-7 min-w-fit max-w-28 items-center rounded-full border-[0.5px] border-solid px-2 py-0 transition-colors duration-150",
				colors.bg,
				colors.text,
				className,
			)}
			{...props}
		>
			{showDot && (
				<div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
					<div
						className={cn("h-2 w-2 rounded-full", colors.dot)}
						aria-hidden="true"
					/>
				</div>
			)}
			<span
				className={cn(
					"overflow-hidden text-ellipsis whitespace-nowrap font-medium text-xs",
					showDot ? "ml-1.5" : "ml-1",
				)}
			>
				{displayText}
			</span>
		</div>
	);
}

export { detectColorScheme, capitalizeStatus, type StatusColorScheme };
