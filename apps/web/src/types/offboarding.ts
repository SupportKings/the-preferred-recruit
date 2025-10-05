export interface OffboardingItem {
	id: string;
	title: string;
	description?: string | null;
	category:
		| "data_export"
		| "access_removal"
		| "handover"
		| "feedback"
		| "legal";
	priority: "low" | "medium" | "high" | "critical";
	estimated_hours?: number | null;
	is_required: boolean;
	order_index: number;
	created_at: string;
	updated_at: string;
}

export interface ClientOffboardingItem {
	id: string;
	client_id: string;
	offboarding_item_id: string;
	status: "not_started" | "in_progress" | "completed" | "skipped";
	assigned_to?: string | null;
	due_date?: string | null;
	completed_at?: string | null;
	notes?: string | null;
	created_at: string;
	updated_at: string;
	offboarding_item: OffboardingItem;
	assigned_user?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	} | null;
}

export interface OffboardingProgress {
	total_items: number;
	completed_items: number;
	in_progress_items: number;
	skipped_items: number;
	percentage: number;
	estimated_completion_date?: string | null;
}

export interface OffboardingCategory {
	category: OffboardingItem["category"];
	items: ClientOffboardingItem[];
	progress: {
		total: number;
		completed: number;
		percentage: number;
	};
}

export interface OffboardingFormData {
	status: ClientOffboardingItem["status"];
	assigned_to?: string;
	due_date?: string;
	notes?: string;
}

export interface OffboardingReason {
	id: string;
	reason: string;
	category: "voluntary" | "involuntary" | "migration" | "other";
	description?: string | null;
}
