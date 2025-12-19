/**
 * Import University Data Script
 *
 * Updates universities table with:
 * - institution_flags_raw (HBCU, Community College, Women only)
 * - us_news_ranking_national_2018 (only if null)
 * - us_news_ranking_liberal_arts_2018 (only if null)
 *
 * Matching strategy: IPEDS/NCES ID (primary), university name (fallback)
 *
 * Usage: bun run apps/web/scripts/import-university-data.ts
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from apps/web/.env
config({ path: resolve(__dirname, "../.env") });

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error(
		"Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
	);
	console.error("URL:", supabaseUrl);
	console.error("Key exists:", !!supabaseServiceKey);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSV file path
const CSV_PATH = resolve(
	__dirname,
	"../../../Formula Based - Coach List (not editable)  - OG Data Combined.csv",
);

// CSV rows are accessed dynamically due to multiline column headers
type CSVRow = Record<string, string>;

interface UniversityUpdate {
	ipeds_nces_id: string;
	school_name: string;
	institution_flags_raw: string | null;
	us_news_ranking_national_2018: number | null;
	us_news_ranking_liberal_arts_2018: number | null;
}

async function main() {
	console.log("🚀 Starting university data import...\n");

	// Read and parse CSV
	console.log("📖 Reading CSV file...");
	const csvContent = readFileSync(CSV_PATH, "utf-8");

	const records: CSVRow[] = parse(csvContent, {
		columns: true,
		skip_empty_lines: true,
		relax_column_count: true,
	});

	console.log(`   Found ${records.length} rows in CSV\n`);

	// Find column keys dynamically (handles multiline headers)
	const sampleRow = records[0];
	const columnKeys = Object.keys(sampleRow);

	const findColumn = (searchTerms: string[]): string | undefined => {
		return columnKeys.find((key) => {
			const lowerKey = key.toLowerCase();
			return searchTerms.every((term) => lowerKey.includes(term.toLowerCase()));
		});
	};

	const IPEDS_KEY = findColumn(["ipeds"]) || "IPEDS/NCES ID";
	const SCHOOL_KEY = "School";
	const NATIONAL_RANKING_KEY = findColumn(["news", "national", "2018"]);
	const LIBERAL_ARTS_KEY = findColumn(["news", "liberal", "arts"]);
	const HBCU_KEY = findColumn(["hbcu"]);

	console.log("📋 Detected column mappings:");
	console.log(`   IPEDS: "${IPEDS_KEY}"`);
	console.log(`   National Ranking: "${NATIONAL_RANKING_KEY}"`);
	console.log(`   Liberal Arts Ranking: "${LIBERAL_ARTS_KEY}"`);
	console.log(`   HBCU: "${HBCU_KEY}"\n`);

	// Group by IPEDS ID to get unique universities
	const universityMap = new Map<string, UniversityUpdate>();

	for (const row of records) {
		const ipedsId = row[IPEDS_KEY]?.trim();
		if (!ipedsId || universityMap.has(ipedsId)) continue;

		// Parse rankings - handle empty strings
		const nationalRankingStr = NATIONAL_RANKING_KEY
			? row[NATIONAL_RANKING_KEY]?.trim()
			: "";
		const liberalArtsRankingStr = LIBERAL_ARTS_KEY
			? row[LIBERAL_ARTS_KEY]?.trim()
			: "";

		const nationalRanking = nationalRankingStr
			? Number.parseInt(nationalRankingStr, 10)
			: null;
		const liberalArtsRanking = liberalArtsRankingStr
			? Number.parseInt(liberalArtsRankingStr, 10)
			: null;

		// Get HBCU/institution flags
		const institutionFlags = HBCU_KEY ? row[HBCU_KEY]?.trim() || null : null;

		universityMap.set(ipedsId, {
			ipeds_nces_id: ipedsId,
			school_name: row[SCHOOL_KEY]?.trim() || "",
			institution_flags_raw: institutionFlags,
			us_news_ranking_national_2018: Number.isNaN(nationalRanking)
				? null
				: nationalRanking,
			us_news_ranking_liberal_arts_2018: Number.isNaN(liberalArtsRanking)
				? null
				: liberalArtsRanking,
		});
	}

	console.log(`📊 Found ${universityMap.size} unique universities in CSV\n`);

	// Fetch existing universities from database (fetch all with pagination)
	console.log("🔍 Fetching existing universities from database...");
	const existingUniversities: Array<{
		id: string;
		name: string | null;
		ipeds_nces_id: string | null;
		institution_flags_raw: string | null;
		us_news_ranking_national_2018: number | null;
		us_news_ranking_liberal_arts_2018: number | null;
	}> = [];

	let offset = 0;
	const pageSize = 1000;
	let hasMore = true;

	while (hasMore) {
		const { data, error } = await supabase
			.from("universities")
			.select(
				"id, name, ipeds_nces_id, institution_flags_raw, us_news_ranking_national_2018, us_news_ranking_liberal_arts_2018",
			)
			.range(offset, offset + pageSize - 1);

		if (error) {
			console.error("Error fetching universities:", error);
			process.exit(1);
		}

		if (data && data.length > 0) {
			existingUniversities.push(...data);
			offset += pageSize;
			hasMore = data.length === pageSize;
		} else {
			hasMore = false;
		}
	}

	console.log(`   Found ${existingUniversities.length} universities in DB\n`);

	// Create lookup maps
	const byIpedsId = new Map(
		existingUniversities
			?.filter((u) => u.ipeds_nces_id)
			.map((u) => [u.ipeds_nces_id, u]),
	);

	const byName = new Map(
		existingUniversities
			.filter((u) => u.name)
			.map((u) => [u.name!.toLowerCase(), u]),
	);

	// Process updates
	let matchedCount = 0;
	let updatedCount = 0;
	let skippedCount = 0;
	let notFoundCount = 0;

	const updates: Array<{
		id: string;
		institution_flags_raw?: string;
		us_news_ranking_national_2018?: number;
		us_news_ranking_liberal_arts_2018?: number;
	}> = [];

	console.log("🔄 Processing updates...\n");

	for (const [ipedsId, csvData] of universityMap) {
		// Try to find matching university
		let dbUniversity = byIpedsId.get(ipedsId);

		// Fallback to name matching
		if (!dbUniversity && csvData.school_name) {
			dbUniversity = byName.get(csvData.school_name.toLowerCase());
		}

		if (!dbUniversity) {
			notFoundCount++;
			continue;
		}

		matchedCount++;

		// Determine what needs updating
		const update: {
			id: string;
			institution_flags_raw?: string;
			us_news_ranking_national_2018?: number;
			us_news_ranking_liberal_arts_2018?: number;
		} = { id: dbUniversity.id };

		let needsUpdate = false;

		// Update institution_flags_raw if we have data and DB is empty
		if (csvData.institution_flags_raw && !dbUniversity.institution_flags_raw) {
			update.institution_flags_raw = csvData.institution_flags_raw;
			needsUpdate = true;
		}

		// Update national ranking only if DB is null
		if (
			csvData.us_news_ranking_national_2018 !== null &&
			dbUniversity.us_news_ranking_national_2018 === null
		) {
			update.us_news_ranking_national_2018 =
				csvData.us_news_ranking_national_2018;
			needsUpdate = true;
		}

		// Update liberal arts ranking only if DB is null
		if (
			csvData.us_news_ranking_liberal_arts_2018 !== null &&
			dbUniversity.us_news_ranking_liberal_arts_2018 === null
		) {
			update.us_news_ranking_liberal_arts_2018 =
				csvData.us_news_ranking_liberal_arts_2018;
			needsUpdate = true;
		}

		if (needsUpdate) {
			updates.push(update);
		} else {
			skippedCount++;
		}
	}

	console.log("📋 Summary before update:");
	console.log(`   Matched: ${matchedCount}`);
	console.log(`   To update: ${updates.length}`);
	console.log(`   Skipped (no changes): ${skippedCount}`);
	console.log(`   Not found in DB: ${notFoundCount}\n`);

	// Apply updates in batches
	if (updates.length > 0) {
		console.log("💾 Applying updates to database...");

		const BATCH_SIZE = 100;
		for (let i = 0; i < updates.length; i += BATCH_SIZE) {
			const batch = updates.slice(i, i + BATCH_SIZE);

			for (const update of batch) {
				const { id, ...data } = update;
				const { error } = await supabase
					.from("universities")
					.update(data)
					.eq("id", id);

				if (error) {
					console.error(`   Error updating university ${id}:`, error);
				} else {
					updatedCount++;
				}
			}

			console.log(
				`   Processed ${Math.min(i + BATCH_SIZE, updates.length)}/${updates.length}`,
			);
		}
	}

	console.log("\n✅ Import complete!");
	console.log(`   Total updated: ${updatedCount}`);
}

main().catch(console.error);
