/**
 * Database Cleanup Script
 *
 * This script deletes all existing coach-related data from the database
 * Run this BEFORE importing to ensure a clean slate
 *
 * Run with: bun --env-file=apps/web/.env apps/web/data-import/clean-database.ts
 *
 * ⚠️ WARNING: This will delete ALL data from these tables:
 * - university_jobs
 * - coaches
 * - university_divisions
 * - university_conferences
 * - universities
 * - divisions
 * - conferences
 * - governing_bodies
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/utils/supabase/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error("❌ Missing environment variables");
	console.error(
		"   Make sure to run with: bun --env-file=apps/web/.env apps/web/data-import/clean-database.ts",
	);
	process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function confirmDeletion(): Promise<boolean> {
	console.log("\n⚠️  WARNING: This will DELETE ALL data from the following tables:");
	console.log("   - university_jobs");
	console.log("   - coaches");
	console.log("   - university_divisions");
	console.log("   - university_conferences");
	console.log("   - universities");
	console.log("   - divisions");
	console.log("   - conferences");
	console.log("   - governing_bodies");
	console.log("\n   This action CANNOT be undone!");

	// Count current records
	const [jobs, coaches, uniDivs, uniConfs, unis, divs, confs, govBodies] =
		await Promise.all([
			supabase
				.from("university_jobs")
				.select("id", { count: "exact", head: true }),
			supabase.from("coaches").select("id", { count: "exact", head: true }),
			supabase
				.from("university_divisions")
				.select("id", { count: "exact", head: true }),
			supabase
				.from("university_conferences")
				.select("id", { count: "exact", head: true }),
			supabase
				.from("universities")
				.select("id", { count: "exact", head: true }),
			supabase.from("divisions").select("id", { count: "exact", head: true }),
			supabase
				.from("conferences")
				.select("id", { count: "exact", head: true }),
			supabase
				.from("governing_bodies")
				.select("id", { count: "exact", head: true }),
		]);

	console.log("\n📊 Current record counts:");
	console.log(`   - University Jobs: ${jobs.count || 0}`);
	console.log(`   - Coaches: ${coaches.count || 0}`);
	console.log(`   - University-Division Links: ${uniDivs.count || 0}`);
	console.log(`   - University-Conference Links: ${uniConfs.count || 0}`);
	console.log(`   - Universities: ${unis.count || 0}`);
	console.log(`   - Divisions: ${divs.count || 0}`);
	console.log(`   - Conferences: ${confs.count || 0}`);
	console.log(`   - Governing Bodies: ${govBodies.count || 0}`);

	console.log('\n   Type "yes" to continue or anything else to cancel:');

	// Read from stdin
	const response = await new Promise<string>((resolve) => {
		process.stdin.once("data", (data) => {
			resolve(data.toString().trim().toLowerCase());
		});
	});

	return response === "yes";
}

async function deleteTable(
	tableName: string,
	displayName: string,
): Promise<void> {
	console.log(`\n🗑️  Deleting ${displayName}...`);

	const { error, count } = await supabase
		.from(tableName as any)
		.delete()
		.neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (using dummy condition)

	if (error) {
		console.error(`❌ Error deleting ${displayName}:`, error);
		throw error;
	}

	console.log(`✅ Deleted ${displayName}`);
}

async function main() {
	console.log("🧹 Database Cleanup Script");
	console.log("=".repeat(60));

	// Ask for confirmation
	const confirmed = await confirmDeletion();

	if (!confirmed) {
		console.log("\n❌ Cleanup cancelled");
		process.exit(0);
	}

	console.log("\n🚀 Starting cleanup...");

	try {
		// Delete in reverse dependency order
		await deleteTable("university_jobs", "University Jobs");
		await deleteTable("coaches", "Coaches");
		await deleteTable("university_divisions", "University-Division Links");
		await deleteTable("university_conferences", "University-Conference Links");
		await deleteTable("universities", "Universities");
		await deleteTable("divisions", "Divisions");
		await deleteTable("conferences", "Conferences");
		await deleteTable("governing_bodies", "Governing Bodies");

		console.log("\n✨ Cleanup complete!");
		console.log(
			"\n   You can now run the import script to add fresh data:",
		);
		console.log(
			"   bun --env-file=apps/web/.env apps/web/data-import/import-coach-data.ts",
		);
	} catch (error) {
		console.error("\n❌ Cleanup failed:", error);
		process.exit(1);
	}

	process.exit(0);
}

// Run the cleanup
main().catch((error) => {
	console.error("❌ Fatal error:", error);
	process.exit(1);
});
