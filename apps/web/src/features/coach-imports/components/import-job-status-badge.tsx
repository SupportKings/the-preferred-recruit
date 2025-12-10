import {
	CheckCircle2,
	Circle,
	Loader2,
	XCircle,
	type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { ImportStatus } from "../types/import-types";

interface ImportJobStatusBadgeProps {
	status: ImportStatus;
}

const statusConfig: Record<
	ImportStatus,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
		icon: LucideIcon;
		className?: string;
	}
> = {
	pending: {
		label: "Pending",
		variant: "outline",
		icon: Circle,
		className: "text-yellow-600 dark:text-yellow-400",
	},
	processing: {
		label: "Processing",
		variant: "outline",
		icon: Loader2,
		className: "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400",
	},
	completed: {
		label: "Completed",
		variant: "secondary",
		icon: CheckCircle2,
		className: "text-green-600 dark:text-green-400",
	},
	failed: {
		label: "Failed",
		variant: "destructive",
		icon: XCircle,
	},
};

export function ImportJobStatusBadge({ status }: ImportJobStatusBadgeProps) {
	const config = statusConfig[status];
	const Icon = config.icon;

	return (
		<Badge variant={config.variant} className={config.className}>
			<Icon
				className={`mr-1 h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`}
			/>
			{config.label}
		</Badge>
	);
}
