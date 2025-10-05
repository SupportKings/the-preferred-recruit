// Mock data structure that can be easily swapped out with real database queries
export interface SearchItem {
	id: string;
	title: string;
	description?: string;
	type: "document" | "user" | "project" | "task";
	url?: string;
	metadata?: Record<string, any>;
}

// Mock data array - replace this with actual database queries
export const mockSearchData: SearchItem[] = [
	{
		id: "doc-1",
		title: "Project Documentation",
		description: "Main project documentation and guidelines",
		type: "document",
		url: "/dashboard/docs/project-documentation",
	},
	{
		id: "doc-2",
		title: "API Reference",
		description: "Complete API documentation for developers",
		type: "document",
		url: "/dashboard/docs/api-reference",
	},
	{
		id: "user-1",
		title: "John Doe",
		description: "john.doe@example.com",
		type: "user",
		url: "/dashboard/users/john-doe",
	},
	{
		id: "user-2",
		title: "Jane Smith",
		description: "jane.smith@example.com",
		type: "user",
		url: "/dashboard/users/jane-smith",
	},
	{
		id: "project-1",
		title: "Website Redesign",
		description: "Q1 2024 website redesign project",
		type: "project",
		url: "/dashboard/projects/website-redesign",
	},
	{
		id: "project-2",
		title: "Mobile App Development",
		description: "Native mobile app for iOS and Android",
		type: "project",
		url: "/dashboard/projects/mobile-app",
	},
	{
		id: "task-1",
		title: "Review Pull Request #123",
		description: "Feature: Add user authentication",
		type: "task",
		url: "/dashboard/tasks/review-pr-123",
	},
	{
		id: "task-2",
		title: "Update Dependencies",
		description: "Monthly security updates for npm packages",
		type: "task",
		url: "/dashboard/tasks/update-deps",
	},
];

// Mock search function - replace with actual API call
export async function searchItems(query: string): Promise<SearchItem[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 100));

	if (!query) return [];

	const lowerQuery = query.toLowerCase();
	return mockSearchData.filter(
		(item) =>
			item.title.toLowerCase().includes(lowerQuery) ||
			item.description?.toLowerCase().includes(lowerQuery),
	);
}
