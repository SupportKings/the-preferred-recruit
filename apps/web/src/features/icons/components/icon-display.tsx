import { cn } from "@/lib/utils";

import { getIconByKey } from "../data/icon-registry";

interface IconDisplayProps {
	iconKey?: string;
	className?: string;
	fallback?: React.ReactNode;
}

export function IconDisplay({
	iconKey,
	className,
	fallback,
}: IconDisplayProps) {
	if (!iconKey) {
		return <>{fallback || null}</>;
	}

	const iconItem = getIconByKey(iconKey);

	if (!iconItem) {
		return <>{fallback || null}</>;
	}

	const Icon = iconItem.icon;

	return <Icon className={cn("h-4 w-4", className)} />;
}
