import type { StatusColorScheme } from "@/components/ui/status-badge";

/**
 * Map application stages to appropriate status badge colors
 */
export function getStageColor(stage: string | null): StatusColorScheme {
	if (!stage) return "gray";

	const stageMap: Record<string, StatusColorScheme> = {
		intro: "blue", // New/starting - info state
		ongoing: "yellow", // In progress - warning/pending state
		visit: "purple", // Special/important stage
		offer: "orange", // Awaiting decision
		committed: "green", // Success/completed
		dropped: "red", // Failed/ended
	};

	return stageMap[stage.toLowerCase()] || "gray";
}
