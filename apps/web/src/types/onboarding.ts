export interface OnboardingItem {
	id: string;
	title: string;
	description?: string | null;
	category: "documentation" | "training" | "setup" | "meeting";
	priority: "low" | "medium" | "high" | "critical";
	estimated_hours?: number | null;
	dependencies?: string[] | null;
	is_required: boolean;
	order_index: number;
	created_at: string;
	updated_at: string;
}

export interface ClientOnboardingItem {
	id: string;
	client_id: string;
	onboarding_item_id: string;
	status: "not_started" | "in_progress" | "completed" | "blocked";
	assigned_to?: string | null;
	due_date?: string | null;
	completed_at?: string | null;
	notes?: string | null;
	created_at: string;
	updated_at: string;
	onboarding_item: OnboardingItem;
	assigned_user?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	} | null;
}

export interface OnboardingProgress {
	total_items: number;
	completed_items: number;
	in_progress_items: number;
	blocked_items: number;
	percentage: number;
	estimated_completion_date?: string | null;
}

export interface OnboardingCategory {
	category: OnboardingItem["category"];
	items: ClientOnboardingItem[];
	progress: {
		total: number;
		completed: number;
		percentage: number;
	};
}

export interface OnboardingFormData {
	status: ClientOnboardingItem["status"];
	assigned_to?: string;
	due_date?: string;
	notes?: string;
}
