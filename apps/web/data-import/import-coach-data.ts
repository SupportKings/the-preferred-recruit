/**
 * Coach Data Import Script
 *
 * This script imports coach data from the "Coach List.xlsx" file into the database.
 * It processes three sheets in order:
 * 1. Upload - Unversities -> universities, governing_bodies, conferences, divisions
 * 2. Upload - coaches -> coaches table
 * 3. Upload - University Jobs -> university_jobs table (links coaches to universities)
 *
 * Run with: bun --env-file=apps/web/.env apps/web/data-import/import-coach-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import type { Database } from "../src/utils/supabase/database.types";

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error(
		"❌ Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
	);
	console.error(
		"   Make sure to run with: bun --env-file=apps/web/.env apps/web/data-import/import-coach-data.ts",
	);
	process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Types for CSV data
interface UniversityRow {
	name: string;
	state: string;
	city: string;
	region: string;
	conference: string;
	divison: string; // Note: misspelled in CSV as "divison"
	"governing body": string;
	ipeds_nces_id: string;
	religious_affiliation: string;
	average_gpa: number;
	us_news_ranking_national_2018: number;
	us_news_ranking_liberal_arts_2018: number;
	majors_offered_url: string;
	sat_ebrw_25th: number;
	sat_ebrw_75th: number;
	sat_math_25th: number;
	sat_math_75th: number;
	act_composite_25th: number;
	act_composite_75th: number;
	acceptance_rate_pct: string; // Comes as percentage string like "86.83%"
}

interface CoachRow {
	full_name: string;
	twitter_profile: string;
	linkedin_profile: string;
	instagram_profile: string;
	primary_specialty: string;
}

interface UniversityJobRow {
	coach_id: string; // Actually coach name, will need to lookup
	university_id: string; // Actually university name, will need to lookup
	job_title: string;
	work_email: string;
	work_phone: string;
}

// Helper functions
function parsePercentage(value: unknown): number | null {
	if (value === null || value === undefined) return null;
	if (typeof value === "number") return value;
	// Convert to string and parse
	const str = String(value).replace("%", "").trim();
	if (str === "" || str === "-" || str === "N/A") return null;
	const parsed = Number.parseFloat(str);
	return Number.isNaN(parsed) ? null : parsed;
}

function cleanString(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	// Convert to string if not already
	const str = typeof value === "string" ? value : String(value);
	const cleaned = str.trim();
	if (cleaned === "" || cleaned === "-" || cleaned === "N/A") return null;
	return cleaned;
}

function cleanNumber(value: unknown): number | null {
	if (value === null || value === undefined) return null;
	if (typeof value === "number") return value;
	// Convert to string and parse
	const str = String(value).trim();
	if (str === "" || str === "-" || str === "N/A") return null;
	const parsed = Number.parseFloat(str);
	return Number.isNaN(parsed) ? null : parsed;
}

// Main import functions
async function importGoverningBodies(
	rows: UniversityRow[],
): Promise<Map<string, string>> {
	console.log("\n🏛️  Importing governing bodies...");

	const governingBodyNames = new Set<string>();
	for (const row of rows) {
		const govBody = cleanString(row["governing body"]);
		if (govBody) {
			governingBodyNames.add(govBody);
		}
	}

	console.log(`Found ${governingBodyNames.size} unique governing bodies`);

	const governingBodyMap = new Map<string, string>(); // name -> id

	for (const name of governingBodyNames) {
		const { data, error } = await supabase
			.from("governing_bodies")
			.upsert({ name }, { onConflict: "name", ignoreDuplicates: false })
			.select("id, name")
			.single<{ id: string; name: string }>();

		if (error) {
			console.error(`❌ Error importing governing body "${name}":`, error);
		} else if (data) {
			governingBodyMap.set(data.name, data.id);
		}
	}

	console.log(`✅ Governing Bodies: ${governingBodyMap.size} imported`);
	return governingBodyMap;
}

async function importConferences(
	rows: UniversityRow[],
	governingBodyMap: Map<string, string>,
): Promise<Map<string, string>> {
	console.log("\n🏈 Importing conferences...");

	const conferenceData = new Map<
		string,
		{ name: string; governingBody: string }
	>();

	for (const row of rows) {
		const conferenceName = cleanString(row.conference);
		const govBodyName = cleanString(row["governing body"]);

		if (conferenceName && govBodyName) {
			conferenceData.set(conferenceName, {
				name: conferenceName,
				governingBody: govBodyName,
			});
		}
	}

	console.log(`Found ${conferenceData.size} unique conferences`);

	const conferenceMap = new Map<string, string>(); // name -> id

	for (const [name, { governingBody }] of conferenceData) {
		const governingBodyId = governingBodyMap.get(governingBody);

		if (!governingBodyId) {
			console.warn(
				`⚠️  Governing body not found for conference "${name}": ${governingBody}`,
			);
			continue;
		}

		const { data, error } = await supabase
			.from("conferences")
			.upsert(
				{ name, governing_body_id: governingBodyId, is_active: true },
				{ onConflict: "name", ignoreDuplicates: false },
			)
			.select("id, name")
			.single<{ id: string; name: string }>();

		if (error) {
			console.error(`❌ Error importing conference "${name}":`, error);
		} else if (data) {
			conferenceMap.set(data.name, data.id);
		}
	}

	console.log(`✅ Conferences: ${conferenceMap.size} imported`);
	return conferenceMap;
}

async function importDivisions(
	rows: UniversityRow[],
	governingBodyMap: Map<string, string>,
): Promise<Map<string, string>> {
	console.log("\n🎯 Importing divisions...");

	const divisionData = new Map<
		string,
		{ name: string; governingBody: string; level: string }
	>();

	for (const row of rows) {
		const divisionName = cleanString(row.divison); // Note: typo in CSV
		const govBodyName = cleanString(row["governing body"]);

		if (divisionName && govBodyName) {
			// Extract level from division name (e.g., "D1" -> "1", "D2" -> "2", "D3" -> "3")
			let level = divisionName;
			if (divisionName.startsWith("D")) {
				level = divisionName.substring(1);
			}

			divisionData.set(divisionName, {
				name: divisionName,
				governingBody: govBodyName,
				level,
			});
		}
	}

	console.log(`Found ${divisionData.size} unique divisions`);

	const divisionMap = new Map<string, string>(); // name -> id

	for (const [name, { governingBody, level }] of divisionData) {
		const governingBodyId = governingBodyMap.get(governingBody);

		if (!governingBodyId) {
			console.warn(
				`⚠️  Governing body not found for division "${name}": ${governingBody}`,
			);
			continue;
		}

		const { data, error } = await supabase
			.from("divisions")
			.upsert(
				{ name, governing_body_id: governingBodyId, level, is_active: true },
				{ onConflict: "name", ignoreDuplicates: false },
			)
			.select("id, name")
			.single<{ id: string; name: string }>();

		if (error) {
			console.error(`❌ Error importing division "${name}":`, error);
		} else if (data) {
			divisionMap.set(data.name, data.id);
		}
	}

	console.log(`✅ Divisions: ${divisionMap.size} imported`);
	return divisionMap;
}

async function importUniversities(
	rows: UniversityRow[],
): Promise<Map<string, string>> {
	console.log(`\n📚 Importing ${rows.length} universities...`);

	const universityMap = new Map<string, string>(); // name -> id
	const batchSize = 100;
	let imported = 0;
	let errors = 0;

	for (let i = 0; i < rows.length; i += batchSize) {
		const batch = rows.slice(i, i + batchSize);

		const universities = batch.map((row) => ({
			name: cleanString(row.name),
			state: cleanString(row.state),
			city: cleanString(row.city),
			region: cleanString(row.region),
			ipeds_nces_id: cleanString(row.ipeds_nces_id),
			religious_affiliation: cleanString(row.religious_affiliation),
			average_gpa: cleanNumber(row.average_gpa),
			us_news_ranking_national_2018: cleanNumber(
				row.us_news_ranking_national_2018,
			),
			us_news_ranking_liberal_arts_2018: cleanNumber(
				row.us_news_ranking_liberal_arts_2018,
			),
			majors_offered_url: cleanString(row.majors_offered_url),
			sat_ebrw_25th: cleanNumber(row.sat_ebrw_25th),
			sat_ebrw_75th: cleanNumber(row.sat_ebrw_75th),
			sat_math_25th: cleanNumber(row.sat_math_25th),
			sat_math_75th: cleanNumber(row.sat_math_75th),
			act_composite_25th: cleanNumber(row.act_composite_25th),
			act_composite_75th: cleanNumber(row.act_composite_75th),
			acceptance_rate_pct: parsePercentage(row.acceptance_rate_pct),
			is_active: true,
		}));

		const { data, error } = await supabase
			.from("universities")
			.upsert(universities, {
				onConflict: "name",
				ignoreDuplicates: false,
			})
			.select<"id, name", { id: string; name: string }>("id, name");

		if (error) {
			console.error(`❌ Error importing batch ${i / batchSize + 1}:`, error);
			errors += batch.length;
		} else {
			imported += data.length;
			for (const uni of data) {
				if (uni.name) {
					universityMap.set(uni.name, uni.id);
				}
			}
		}
	}

	console.log(`✅ Universities: ${imported} imported, ${errors} errors`);
	return universityMap;
}

async function linkUniversityConferences(
	rows: UniversityRow[],
	universityMap: Map<string, string>,
	conferenceMap: Map<string, string>,
): Promise<void> {
	console.log("\n🔗 Linking universities to conferences...");

	const links: Array<{
		university_id: string;
		conference_id: string | null;
		start_date: string;
	}> = [];

	for (const row of rows) {
		const universityName = cleanString(row.name);
		const conferenceName = cleanString(row.conference);

		if (!universityName) continue;

		const universityId = universityMap.get(universityName);
		const conferenceId = conferenceName
			? conferenceMap.get(conferenceName)
			: null;

		if (!universityId) {
			console.warn(`⚠️  University not found: ${universityName}`);
			continue;
		}

		links.push({
			university_id: universityId,
			conference_id: conferenceId || null,
			start_date: new Date().toISOString().split("T")[0], // Today's date
		});
	}

	const batchSize = 100;
	let imported = 0;

	for (let i = 0; i < links.length; i += batchSize) {
		const batch = links.slice(i, i + batchSize);

		const { data, error } = await supabase
			.from("university_conferences")
			.upsert(batch, {
				onConflict: "university_id,conference_id",
				ignoreDuplicates: false,
			})
			.select("id");

		if (error) {
			console.error(`❌ Error linking batch ${i / batchSize + 1}:`, error);
		} else {
			imported += data.length;
		}
	}

	console.log(`✅ University-Conference links: ${imported} created`);
}

async function linkUniversityDivisions(
	rows: UniversityRow[],
	universityMap: Map<string, string>,
	divisionMap: Map<string, string>,
): Promise<void> {
	console.log("\n🔗 Linking universities to divisions...");

	const links: Array<{
		university_id: string;
		division_id: string;
		start_date: string;
	}> = [];

	for (const row of rows) {
		const universityName = cleanString(row.name);
		const divisionName = cleanString(row.divison); // Note: typo in CSV

		if (!universityName || !divisionName) continue;

		const universityId = universityMap.get(universityName);
		const divisionId = divisionMap.get(divisionName);

		if (!universityId) {
			console.warn(`⚠️  University not found: ${universityName}`);
			continue;
		}

		if (!divisionId) {
			console.warn(`⚠️  Division not found: ${divisionName}`);
			continue;
		}

		links.push({
			university_id: universityId,
			division_id: divisionId,
			start_date: new Date().toISOString().split("T")[0], // Today's date
		});
	}

	const batchSize = 100;
	let imported = 0;

	for (let i = 0; i < links.length; i += batchSize) {
		const batch = links.slice(i, i + batchSize);

		const { data, error } = await supabase
			.from("university_divisions")
			.upsert(batch, {
				onConflict: "university_id,division_id",
				ignoreDuplicates: false,
			})
			.select("id");

		if (error) {
			console.error(`❌ Error linking batch ${i / batchSize + 1}:`, error);
		} else {
			imported += data.length;
		}
	}

	console.log(`✅ University-Division links: ${imported} created`);
}

async function importCoaches(rows: CoachRow[]): Promise<Map<string, string>> {
	// Only import coaches that have a valid full_name
	const coachesToImport = rows.filter((row) => {
		const fullName = cleanString(row.full_name);
		return fullName !== null && fullName.length > 0;
	});

	const skipped = rows.length - coachesToImport.length;

	console.log(
		`\n👤 Importing ${coachesToImport.length} coaches (${skipped} skipped - empty name)...`,
	);

	const coachMap = new Map<string, string>(); // full_name -> id
	const batchSize = 100;
	let imported = 0;
	let errors = 0;

	for (let i = 0; i < coachesToImport.length; i += batchSize) {
		const batch = coachesToImport.slice(i, i + batchSize);

		const coaches = batch
			.map((row) => {
				const fullName = cleanString(row.full_name);
				if (!fullName) return null;

				return {
					full_name: fullName,
					twitter_profile: cleanString(row.twitter_profile),
					linkedin_profile: cleanString(row.linkedin_profile),
					instagram_profile: cleanString(row.instagram_profile),
				};
			})
			.filter((coach) => coach !== null);

		if (coaches.length === 0) continue;

		const { data, error } = await supabase
			.from("coaches")
			.upsert(coaches, {
				onConflict: "full_name",
				ignoreDuplicates: false,
			})
			.select<"id, full_name", { id: string; full_name: string }>(
				"id, full_name",
			);

		if (error) {
			console.error(`❌ Error importing batch ${i / batchSize + 1}:`, error);
			errors += batch.length;
		} else {
			imported += data.length;
			for (const coach of data) {
				if (coach.full_name) {
					coachMap.set(coach.full_name, coach.id);
				}
			}
		}
	}

	console.log(`✅ Coaches: ${imported} imported, ${errors} errors`);
	return coachMap;
}

async function importUniversityJobs(
	rows: UniversityJobRow[],
	coachMap: Map<string, string>,
	universityMap: Map<string, string>,
): Promise<void> {
	console.log(`\n💼 Importing ${rows.length} university jobs...`);

	const batchSize = 100;
	let imported = 0;
	let skipped = 0;
	let errors = 0;

	for (let i = 0; i < rows.length; i += batchSize) {
		const batch = rows.slice(i, i + batchSize);

		const jobs = batch
			.map((row) => {
				const coachId = coachMap.get(row.coach_id);
				const universityId = universityMap.get(row.university_id);

				if (!coachId) {
					console.warn(`⚠️  Coach not found: ${row.coach_id}`);
					skipped++;
					return null;
				}

				if (!universityId) {
					console.warn(`⚠️  University not found: ${row.university_id}`);
					skipped++;
					return null;
				}

				return {
					coach_id: coachId,
					university_id: universityId,
					job_title: cleanString(row.job_title),
					work_email: cleanString(row.work_email),
					work_phone: cleanString(row.work_phone),
				};
			})
			.filter((job) => job !== null);

		if (jobs.length === 0) continue;

		// Try upsert first (if constraint exists), fall back to insert
		const upsertResult = await supabase
			.from("university_jobs")
			.upsert(jobs, {
				onConflict: "coach_id,university_id",
				ignoreDuplicates: false,
			})
			.select("id");

		// If constraint doesn't exist (error code 42P10), use insert instead
		if (upsertResult.error?.code === "42P10") {
			const insertResult = await supabase
				.from("university_jobs")
				.insert(jobs)
				.select("id");

			if (insertResult.error) {
				console.error(
					`❌ Error importing batch ${i / batchSize + 1}:`,
					insertResult.error,
				);
				errors += batch.length;
			} else {
				imported += insertResult.data.length;
			}
		} else if (upsertResult.error) {
			console.error(
				`❌ Error importing batch ${i / batchSize + 1}:`,
				upsertResult.error,
			);
			errors += batch.length;
		} else {
			imported += upsertResult.data.length;
		}
	}

	console.log(
		`✅ University Jobs: ${imported} imported, ${skipped} skipped, ${errors} errors`,
	);
}

// Clean existing data
async function cleanExistingData() {
	console.log("\n🧹 Cleaning existing import-related data...");

	try {
		// Only delete data that was imported (not manually created records)
		// Delete join tables first
		const { error: jobsError } = await supabase
			.from("university_jobs")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");

		if (jobsError) {
			console.warn(
				`   ⚠️  Could not delete University Jobs: ${jobsError.message}`,
			);
		} else {
			console.log("   ✅ Deleted University Jobs");
		}

		const { error: uniDivsError } = await supabase
			.from("university_divisions")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");

		if (uniDivsError) {
			console.warn(
				`   ⚠️  Could not delete University-Division Links: ${uniDivsError.message}`,
			);
		} else {
			console.log("   ✅ Deleted University-Division Links");
		}

		const { error: uniConfsError } = await supabase
			.from("university_conferences")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");

		if (uniConfsError) {
			console.warn(
				`   ⚠️  Could not delete University-Conference Links: ${uniConfsError.message}`,
			);
		} else {
			console.log("   ✅ Deleted University-Conference Links");
		}

		// Try to delete coaches and universities
		// If they have dependencies from other tables, they'll be skipped
		const { error: coachesError } = await supabase
			.from("coaches")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");

		if (coachesError?.code === "23503") {
			console.log(
				"   ⚠️  Skipped Coaches (has dependencies - will update existing records)",
			);
		} else if (coachesError) {
			console.warn(`   ⚠️  Could not delete Coaches: ${coachesError.message}`);
		} else {
			console.log("   ✅ Deleted Coaches");
		}

		const { error: universitiesError } = await supabase
			.from("universities")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");

		if (universitiesError?.code === "23503") {
			console.log(
				"   ⚠️  Skipped Universities (has dependencies - will update existing records)",
			);
		} else if (universitiesError) {
			console.warn(
				`   ⚠️  Could not delete Universities: ${universitiesError.message}`,
			);
		} else {
			console.log("   ✅ Deleted Universities");
		}

		// Delete reference tables
		await supabase
			.from("divisions")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");
		console.log("   ✅ Deleted Divisions");

		await supabase
			.from("conferences")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");
		console.log("   ✅ Deleted Conferences");

		await supabase
			.from("governing_bodies")
			.delete()
			.neq("id", "00000000-0000-0000-0000-000000000000");
		console.log("   ✅ Deleted Governing Bodies");

		console.log("✅ Cleanup complete\n");
	} catch (error) {
		console.error("❌ Cleanup failed:", error);
		throw error;
	}
}

// Main execution
async function main() {
	console.log("🚀 Starting coach data import...\n");

	// Clean existing data first
	await cleanExistingData();

	// Read the Excel file
	const workbook = XLSX.readFile("apps/web/data-import/Coach List.xlsx");

	// Parse each sheet
	const universitiesSheet = workbook.Sheets["Upload - Unversities"];
	const coachesSheet = workbook.Sheets["Upload - coaches"];
	const jobsSheet = workbook.Sheets["Upload - University Jobs"];

	const universities =
		XLSX.utils.sheet_to_json<UniversityRow>(universitiesSheet);
	const coaches = XLSX.utils.sheet_to_json<CoachRow>(coachesSheet);
	const jobs = XLSX.utils.sheet_to_json<UniversityJobRow>(jobsSheet);

	console.log("📊 Loaded data:");
	console.log(`   - ${universities.length} universities`);
	console.log(`   - ${coaches.length} coaches`);
	console.log(`   - ${jobs.length} university jobs`);

	// Step 1: Import governing bodies, conferences, and divisions
	const governingBodyMap = await importGoverningBodies(universities);
	const conferenceMap = await importConferences(universities, governingBodyMap);
	const divisionMap = await importDivisions(universities, governingBodyMap);

	// Step 2: Import universities
	const universityMap = await importUniversities(universities);

	// Step 3: Link universities to conferences and divisions
	await linkUniversityConferences(universities, universityMap, conferenceMap);
	await linkUniversityDivisions(universities, universityMap, divisionMap);

	// Step 4: Import coaches (skip those with empty names)
	const coachMap = await importCoaches(coaches);

	// Step 5: Import university jobs (links coaches to universities)
	await importUniversityJobs(jobs, coachMap, universityMap);

	console.log("\n✨ Import complete!");
}

// Run the import
main().catch((error) => {
	console.error("❌ Fatal error:", error);
	process.exit(1);
});
