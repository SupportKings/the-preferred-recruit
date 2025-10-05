import type { Database } from "@/utils/supabase/database.types";

// Base audit log type with user information
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"] & {
	changed_by_user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	} | null;
};

// Ticket comment type with user information
export type TicketComment =
	Database["public"]["Tables"]["ticket_comments"]["Row"] & {
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
		};
	};

// Coach comment type with user information
export type CoachComment =
	Database["public"]["Tables"]["coach_comments"]["Row"] & {
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
		};
	};

// Generic activity item that can represent any entity's activity
export type ActivityItem<T = AuditLog | TicketComment | CoachComment> = {
	id: string;
	type: "activity" | "comment" | "client";
	timestamp: string;
	data: T;
};

// Specific activity item types for different entities
export type TicketActivityItem = ActivityItem<AuditLog | TicketComment>;
export type CoachActivityItem = ActivityItem<AuditLog | CoachComment>;

// Legacy type for backward compatibility
export type CombinedActivityItem = TicketActivityItem;
