import type { StatusColorScheme } from "@/components/ui/status-badge";

export function getEntryStatusColor(
	status: string | null | undefined,
): StatusColorScheme {
	if (!status) return "gray";

	const normalizedStatus = status.toLowerCase().trim();

	switch (normalizedStatus) {
		case "included":
			return "green"; // Positive/active state
		case "excluded":
			return "red"; // Negative/rejected state
		case "pending":
			return "yellow"; // Warning/needs attention
		case "contacted":
			return "blue"; // In progress/communication
		case "responded":
			return "purple"; // Special/responded state
		default:
			return "gray";
	}
}
