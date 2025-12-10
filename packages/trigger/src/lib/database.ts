import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Supabase client with service role (full access)
export const supabase = createClient<any>(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	},
);

// Drizzle client for raw SQL if needed
// Use BETTER_AUTH_DATABASE_URL which points to the pooler connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
