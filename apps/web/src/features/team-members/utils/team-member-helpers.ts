// Compute name from first_name and last_name (no database column)
export function getTeamMemberName(teamMember: {
	first_name?: string | null;
	last_name?: string | null;
}): string {
	const firstName = teamMember.first_name || "";
	const lastName = teamMember.last_name || "";
	return `${firstName} ${lastName}`.trim() || "N/A";
}
