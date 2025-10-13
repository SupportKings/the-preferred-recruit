/**
 * Format campaign type for display
 */
export const formatCampaignType = (type: string | null | undefined): string => {
	if (!type) return "Unknown";

	const typeMap: Record<string, string> = {
		top: "Top",
		second_pass: "Second Pass",
		third_pass: "Third Pass",
		personal_best: "Personal Best",
	};

	return typeMap[type.toLowerCase()] || type;
};

/**
 * Format campaign status for display
 */
export const formatCampaignStatus = (
	status: string | null | undefined,
): string => {
	if (!status) return "Unknown";

	const statusMap: Record<string, string> = {
		draft: "Draft",
		active: "Active",
		paused: "Paused",
		completed: "Completed",
		exhausted: "Exhausted",
	};

	return statusMap[status.toLowerCase()] || status;
};
