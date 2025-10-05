import {
	CheckCircleIcon,
	CircleDashedIcon,
	ClockIcon,
	PlayIcon,
} from "lucide-react";
import type { Issue, IssueLabel, IssueStatus, User } from "./types";

// Mock data
const mockLabels: IssueLabel[] = [
	{ id: "1", name: "Bug", color: "red" },
	{ id: "2", name: "Feature", color: "blue" },
	{ id: "3", name: "Enhancement", color: "green" },
	{ id: "4", name: "Documentation", color: "yellow" },
	{ id: "5", name: "Design", color: "purple" },
];

const mockStatuses: IssueStatus[] = [
	{ id: "backlog", name: "Backlog", order: 0, icon: CircleDashedIcon },
	{ id: "todo", name: "Todo", order: 1, icon: ClockIcon },
	{ id: "in-progress", name: "In Progress", order: 2, icon: PlayIcon },
	{ id: "done", name: "Done", order: 3, icon: CheckCircleIcon },
];

const mockUsers: User[] = [
	{ id: "1", name: "John Doe", picture: "https://github.com/shadcn.png" },
	{ id: "2", name: "Jane Smith", picture: "https://github.com/shadcn.png" },
	{ id: "3", name: "Bob Johnson", picture: "https://github.com/shadcn.png" },
	{ id: "4", name: "Alice Brown", picture: "https://github.com/shadcn.png" },
];

const mockIssues: Issue[] = [
	{
		id: "1",
		title: "Fix login bug",
		status: mockStatuses[1], // todo
		assignee: mockUsers[0],
		labels: [mockLabels[0]], // Bug
		estimatedHours: 4,
		startDate: new Date("2024-01-15"),
		endDate: new Date("2024-01-20"),
	},
	{
		id: "2",
		title: "Add dark mode",
		status: mockStatuses[2], // in-progress
		assignee: mockUsers[1],
		labels: [mockLabels[1], mockLabels[4]], // Feature, Design
		estimatedHours: 8,
		startDate: new Date("2024-01-10"),
		endDate: new Date("2024-01-18"),
	},
	{
		id: "3",
		title: "Update documentation",
		status: mockStatuses[3], // done
		assignee: mockUsers[2],
		labels: [mockLabels[3]], // Documentation
		estimatedHours: 2,
		startDate: new Date("2024-01-05"),
		endDate: new Date("2024-01-12"),
	},
	{
		id: "4",
		title: "Performance optimization",
		status: mockStatuses[0], // backlog
		assignee: mockUsers[3],
		labels: [mockLabels[2]], // Enhancement
		estimatedHours: 12,
		startDate: new Date("2024-01-01"),
		endDate: new Date("2024-01-10"),
	},
	{
		id: "5",
		title: "Mobile responsive design",
		status: mockStatuses[1], // todo
		assignee: mockUsers[0],
		labels: [mockLabels[1], mockLabels[4]], // Feature, Design
		estimatedHours: 6,
		startDate: new Date("2024-01-08"),
		endDate: new Date("2024-01-15"),
	},
	{
		id: "6",
		title: "Implement user authentication",
		status: mockStatuses[2], // in-progress
		assignee: mockUsers[1],
		labels: [mockLabels[1], mockLabels[0]], // Feature, Bug
		estimatedHours: 16,
		startDate: new Date("2024-01-12"),
		endDate: new Date("2024-01-25"),
	},
	{
		id: "7",
		title: "Fix navigation menu",
		status: mockStatuses[3], // done
		assignee: mockUsers[2],
		labels: [mockLabels[0]], // Bug
		estimatedHours: 3,
		startDate: new Date("2024-01-03"),
		endDate: new Date("2024-01-06"),
	},
	{
		id: "8",
		title: "Add search functionality",
		status: mockStatuses[1], // todo
		assignee: mockUsers[3],
		labels: [mockLabels[1]], // Feature
		estimatedHours: 10,
		startDate: new Date("2024-01-20"),
		endDate: new Date("2024-01-30"),
	},
	{
		id: "9",
		title: "Optimize database queries",
		status: mockStatuses[0], // backlog
		assignee: mockUsers[0],
		labels: [mockLabels[2]], // Enhancement
		estimatedHours: 8,
		startDate: new Date("2024-01-25"),
		endDate: new Date("2024-02-02"),
	},
	{
		id: "10",
		title: "Create user onboarding flow",
		status: mockStatuses[2], // in-progress
		assignee: mockUsers[1],
		labels: [mockLabels[1], mockLabels[4], mockLabels[3]], // Feature, Design, Documentation
		estimatedHours: 14,
		startDate: new Date("2024-01-18"),
		endDate: new Date("2024-01-28"),
	},
];

// Mock faceted data
const mockFacetedLabels = new Map([
	["1", 6], // Bug - 6 items
	["2", 8], // Feature - 8 items
	["3", 5], // Enhancement - 5 items
	["4", 3], // Documentation - 3 items
	["5", 3], // Design - 3 items
]);

const mockFacetedStatuses = new Map([
	["backlog", 4],
	["todo", 6],
	["in-progress", 5],
	["done", 5],
]);

const mockFacetedUsers = new Map([
	["1", 5], // John Doe
	["2", 5], // Jane Smith
	["3", 5], // Bob Johnson
	["4", 5], // Alice Brown
]);

const mockFacetedEstimatedHours: [number, number] = [2, 20];

// Query functions
export const queries = {
	labels: {
		all: () => ({
			queryKey: ["labels", "all"],
			queryFn: async (): Promise<IssueLabel[]> => {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 100));
				return mockLabels;
			},
		}),
		faceted: () => ({
			queryKey: ["labels", "faceted"],
			queryFn: async (): Promise<Map<string, number>> => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return mockFacetedLabels;
			},
		}),
	},
	statuses: {
		all: () => ({
			queryKey: ["statuses", "all"],
			queryFn: async (): Promise<IssueStatus[]> => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return mockStatuses;
			},
		}),
		faceted: () => ({
			queryKey: ["statuses", "faceted"],
			queryFn: async (): Promise<Map<string, number>> => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return mockFacetedStatuses;
			},
		}),
	},
	users: {
		all: () => ({
			queryKey: ["users", "all"],
			queryFn: async (): Promise<User[]> => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return mockUsers;
			},
		}),
		faceted: () => ({
			queryKey: ["users", "faceted"],
			queryFn: async (): Promise<Map<string, number>> => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return mockFacetedUsers;
			},
		}),
	},
	estimatedHours: {
		faceted: () => ({
			queryKey: ["estimatedHours", "faceted"],
			queryFn: async (): Promise<[number, number]> => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return mockFacetedEstimatedHours;
			},
		}),
	},
	issues: {
		all: (filters: any) => ({
			queryKey: ["issues", "all", filters],
			queryFn: async (): Promise<Issue[]> => {
				await new Promise((resolve) => setTimeout(resolve, 200));
				// Simple filtering logic for demo
				let filteredIssues = [...mockIssues];

				if (filters?.status?.length > 0) {
					filteredIssues = filteredIssues.filter((issue) =>
						filters.status.includes(issue.status.id),
					);
				}

				if (filters?.assignee?.length > 0) {
					filteredIssues = filteredIssues.filter(
						(issue) =>
							issue.assignee && filters.assignee.includes(issue.assignee.id),
					);
				}

				if (filters?.labels?.length > 0) {
					filteredIssues = filteredIssues.filter((issue) =>
						issue.labels?.some((label) => filters.labels.includes(label.id)),
					);
				}

				return filteredIssues;
			},
		}),
	},
};
