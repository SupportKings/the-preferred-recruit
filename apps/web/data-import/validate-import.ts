/**
 * Validation Script for Coach Data Import
 *
 * Run this after import to verify data integrity and quality
 * Usage: bun --env-file=apps/web/.env apps/web/data-import/validate-import.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/utils/supabase/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error("❌ Missing environment variables");
	console.error("   Make sure to run with: bun --env-file=apps/web/.env apps/web/data-import/validate-import.ts");
	process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ValidationResult {
	test: string;
	status: "✅ PASS" | "⚠️  WARN" | "❌ FAIL";
	details: string;
	count?: number;
}

const results: ValidationResult[] = [];

async function countRecords() {
	console.log("\n📊 Counting imported records...\n");

	const [
		governingBodies,
		conferences,
		divisions,
		universities,
		coaches,
		jobs,
		uniConferences,
		uniDivisions,
	] = await Promise.all([
		supabase
			.from("governing_bodies")
			.select("id", { count: "exact", head: true }),
		supabase.from("conferences").select("id", { count: "exact", head: true }),
		supabase.from("divisions").select("id", { count: "exact", head: true }),
		supabase.from("universities").select("id", { count: "exact", head: true }),
		supabase.from("coaches").select("id", { count: "exact", head: true }),
		supabase
			.from("university_jobs")
			.select("id", { count: "exact", head: true }),
		supabase
			.from("university_conferences")
			.select("id", { count: "exact", head: true }),
		supabase
			.from("university_divisions")
			.select("id", { count: "exact", head: true }),
	]);

	const govBodyCount = governingBodies.count || 0;
	const confCount = conferences.count || 0;
	const divCount = divisions.count || 0;
	const uniCount = universities.count || 0;
	const coachCount = coaches.count || 0;
	const jobCount = jobs.count || 0;
	const uniConfCount = uniConferences.count || 0;
	const uniDivCount = uniDivisions.count || 0;

	console.log(`Governing Bodies: ${govBodyCount}`);
	console.log(`Conferences: ${confCount}`);
	console.log(`Divisions: ${divCount}`);
	console.log(`Universities: ${uniCount}`);
	console.log(`Coaches: ${coachCount}`);
	console.log(`University Jobs: ${jobCount}`);
	console.log(`University-Conference Links: ${uniConfCount}`);
	console.log(`University-Division Links: ${uniDivCount}`);

	results.push({
		test: "Record Counts",
		status:
			uniCount > 0 && coachCount > 0 && jobCount > 0 ? "✅ PASS" : "❌ FAIL",
		details: `Universities: ${uniCount}, Coaches: ${coachCount}, Jobs: ${jobCount}, GovBodies: ${govBodyCount}, Conferences: ${confCount}, Divisions: ${divCount}`,
	});

	return {
		govBodyCount,
		confCount,
		divCount,
		uniCount,
		coachCount,
		jobCount,
		uniConfCount,
		uniDivCount,
	};
}

async function checkOrphanedJobs() {
	console.log("\n🔍 Checking for orphaned university jobs...\n");

	// Get all jobs
	const { data: allJobs } = await supabase
		.from("university_jobs")
		.select("id, coach_id, university_id");

	// Get all coaches and universities
	const [coaches, universities] = await Promise.all([
		supabase.from("coaches").select("id"),
		supabase.from("universities").select("id"),
	]);

	const coachIds = new Set(coaches.data?.map((c) => c.id) || []);
	const universityIds = new Set(universities.data?.map((u) => u.id) || []);

	let invalidCoachCount = 0;
	let invalidUniCount = 0;

	for (const job of allJobs || []) {
		if (job.coach_id && !coachIds.has(job.coach_id)) {
			invalidCoachCount++;
		}
		if (job.university_id && !universityIds.has(job.university_id)) {
			invalidUniCount++;
		}
	}

	const orphanedCount = invalidCoachCount + invalidUniCount;

	console.log(`Jobs with invalid coach_id: ${invalidCoachCount}`);
	console.log(`Jobs with invalid university_id: ${invalidUniCount}`);

	results.push({
		test: "Orphaned Records",
		status: orphanedCount === 0 ? "✅ PASS" : "❌ FAIL",
		details: `Found ${orphanedCount} orphaned job records`,
		count: orphanedCount,
	});
}

async function checkDuplicateCoaches() {
	console.log("\n👥 Checking for duplicate coach names...\n");

	const { data: allCoaches } = await supabase
		.from("coaches")
		.select("full_name")
		.not("full_name", "is", null);

	const nameMap = new Map<string, number>();
	for (const coach of allCoaches || []) {
		if (coach.full_name) {
			nameMap.set(coach.full_name, (nameMap.get(coach.full_name) || 0) + 1);
		}
	}

	const duplicateNames = Array.from(nameMap.entries())
		.filter(([_, count]) => count > 1)
		.sort((a, b) => b[1] - a[1]);

	if (duplicateNames.length > 0) {
		console.log(`Found ${duplicateNames.length} duplicate names:`);
		for (const [name, count] of duplicateNames.slice(0, 10)) {
			console.log(`  - ${name}: ${count} occurrences`);
		}
		if (duplicateNames.length > 10) {
			console.log(`  ... and ${duplicateNames.length - 10} more`);
		}
	} else {
		console.log("No duplicate coach names found");
	}

	results.push({
		test: "Duplicate Coach Names",
		status: duplicateNames.length === 0 ? "✅ PASS" : "⚠️  WARN",
		details: `Found ${duplicateNames.length} duplicate names`,
		count: duplicateNames.length,
	});
}

async function checkDataQuality() {
	console.log("\n🔎 Checking data quality...\n");

	// Coaches without email
	const { count: coachesNoEmail } = await supabase
		.from("coaches")
		.select("id", { count: "exact", head: true })
		.is("email", null);

	// Jobs without email
	const { count: jobsNoEmail } = await supabase
		.from("university_jobs")
		.select("id", { count: "exact", head: true })
		.is("work_email", null);

	// Jobs without phone
	const { count: jobsNoPhone } = await supabase
		.from("university_jobs")
		.select("id", { count: "exact", head: true })
		.is("work_phone", null);

	// Universities without key data
	const { count: universitiesNoGPA } = await supabase
		.from("universities")
		.select("id", { count: "exact", head: true })
		.is("average_gpa", null);

	console.log(`Coaches without email: ${coachesNoEmail || 0}`);
	console.log(`Jobs without work email: ${jobsNoEmail || 0}`);
	console.log(`Jobs without work phone: ${jobsNoPhone || 0}`);
	console.log(`Universities without GPA: ${universitiesNoGPA || 0}`);

	results.push({
		test: "Data Quality",
		status: "⚠️  WARN",
		details: `Missing data: ${(coachesNoEmail || 0) + (jobsNoEmail || 0) + (jobsNoPhone || 0)} fields`,
	});
}

async function checkRelationshipIntegrity() {
	console.log("\n🔗 Checking relationship integrity...\n");

	// Coaches without any jobs
	const { data: coachesNoJobs } = await supabase
		.from("coaches")
		.select("id, full_name")
		.not(
			"id",
			"in",
			`(${(await supabase.from("university_jobs").select("coach_id")).data?.map((j) => `'${j.coach_id}'`).join(",") || ""})`,
		)
		.limit(10);

	// Universities without any jobs
	const { data: universitiesNoJobs } = await supabase
		.from("universities")
		.select("id, name")
		.not(
			"id",
			"in",
			`(${(await supabase.from("university_jobs").select("university_id")).data?.map((j) => `'${j.university_id}'`).join(",") || ""})`,
		)
		.limit(10);

	console.log(
		`Coaches without jobs: ${coachesNoJobs?.length || 0} (showing first 10)`,
	);
	if (coachesNoJobs && coachesNoJobs.length > 0) {
		for (const coach of coachesNoJobs.slice(0, 5)) {
			console.log(`  - ${coach.full_name}`);
		}
	}

	console.log(
		`Universities without coaches: ${universitiesNoJobs?.length || 0} (showing first 10)`,
	);
	if (universitiesNoJobs && universitiesNoJobs.length > 0) {
		for (const uni of universitiesNoJobs.slice(0, 5)) {
			console.log(`  - ${uni.name}`);
		}
	}

	results.push({
		test: "Relationship Integrity",
		status: "⚠️  WARN",
		details: `${coachesNoJobs?.length || 0} coaches and ${universitiesNoJobs?.length || 0} universities without jobs`,
	});
}

async function sampleData() {
	console.log("\n📋 Sample imported data...\n");

	const { data: samples } = await supabase
		.from("university_jobs")
		.select(
			`
      id,
      job_title,
      work_email,
      work_phone,
      coaches!inner(full_name, twitter_profile),
      universities!inner(name, state, city)
    `,
		)
		.limit(5);

	if (samples && samples.length > 0) {
		for (const sample of samples) {
			const coach = sample.coaches as unknown as {
				full_name: string;
				twitter_profile: string;
			};
			const uni = sample.universities as unknown as {
				name: string;
				state: string;
				city: string;
			};
			console.log(
				`${coach.full_name} @ ${uni.name} (${uni.city}, ${uni.state})`,
			);
			console.log(`  Title: ${sample.job_title || "N/A"}`);
			console.log(`  Email: ${sample.work_email || "N/A"}`);
			console.log(`  Phone: ${sample.work_phone || "N/A"}`);
			console.log(`  Twitter: ${coach.twitter_profile || "N/A"}`);
			console.log("");
		}
	}

	results.push({
		test: "Sample Data",
		status: samples && samples.length > 0 ? "✅ PASS" : "❌ FAIL",
		details: `Retrieved ${samples?.length || 0} sample records`,
	});
}

async function main() {
	console.log("🔍 Validating Coach Data Import...");

	await countRecords();
	await checkOrphanedJobs();
	await checkDuplicateCoaches();
	await checkDataQuality();
	await checkRelationshipIntegrity();
	await sampleData();

	// Summary
	console.log("\n" + "=".repeat(60));
	console.log("📊 VALIDATION SUMMARY");
	console.log("=".repeat(60));

	for (const result of results) {
		console.log(`${result.status} ${result.test}`);
		console.log(`   ${result.details}`);
	}

	const passed = results.filter((r) => r.status === "✅ PASS").length;
	const warnings = results.filter((r) => r.status === "⚠️  WARN").length;
	const failed = results.filter((r) => r.status === "❌ FAIL").length;

	console.log("\n" + "=".repeat(60));
	console.log(
		`✅ ${passed} passed | ⚠️  ${warnings} warnings | ❌ ${failed} failed`,
	);
	console.log("=".repeat(60) + "\n");

	if (failed > 0) {
		console.log("❌ Validation failed. Please review errors above.");
		process.exit(1);
	} else if (warnings > 0) {
		console.log("⚠️  Validation passed with warnings. Review above.");
	} else {
		console.log("✅ All validations passed!");
	}
}

main().catch((error) => {
	console.error("❌ Validation error:", error);
	process.exit(1);
});
