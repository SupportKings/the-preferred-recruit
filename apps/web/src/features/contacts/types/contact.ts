import type { Tables } from "@/utils/supabase/database.types";

export type Contact = Tables<"contacts"> & {
	contact_athletes?: (Tables<"contact_athletes"> & {
		athlete?: Tables<"athletes"> | null;
	})[];
};
