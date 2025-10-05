export interface Client {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string | null;
	status: "active" | "paused" | "churned";
	start_date: string;
	profile_picture?: string | null;
	product_id?: string | null;
	product_start_date?: string | null;
	product_end_date?: string | null;
	renewal_date?: string | null;
	platform_link?: string | null;
	created_by?: string | null;
	company?: string | null;
	position?: string | null;
	notes?: string | null;
	source?: string | null;
}

export interface ClientWithDetails extends Client {
	product?: {
		id: string;
		name: string;
		description?: string | null;
	} | null;
	coach?: {
		user: {
			id: string;
			name: string;
			email: string;
			image?: string | null;
		};
		start_date: string;
		end_date?: string | null;
		assigned_by?: string | null;
	} | null;
	csc?: {
		user: {
			id: string;
			name: string;
			email: string;
			image?: string | null;
		};
		start_date: string;
		end_date?: string | null;
		assigned_by?: string | null;
	} | null;
	onboarding_progress: {
		percentage: number;
		completed_items: number;
		total_items: number;
	};
}

export interface ClientFormData {
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	company?: string;
	position?: string;
	product_id?: string;
	product_start_date?: string;
	product_end_date?: string;
	renewal_date?: string;
	platform_link?: string;
	coach_id?: string;
	csc_id?: string;
	notes?: string;
	source?: string;
	status: "active" | "paused" | "churned";
}

export interface ClientStats {
	total: number;
	active: number;
	onboarding: number;
	atRisk: number;
}

export interface TeamMember {
	id: string;
	name: string;
	email: string;
	image?: string | null;
}

export interface AssignmentData {
	clientId: string;
	assignmentType: "coach" | "csc";
	userId: string;
}
