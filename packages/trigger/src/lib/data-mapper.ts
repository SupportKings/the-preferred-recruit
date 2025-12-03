import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { CoachRow } from "./excel-parser";
import {
	derivePrimarySpecialty,
	mapDivisionCode,
	nullifyEmptyString,
	parseEventGroups,
	parseFloat,
	parseInteger,
	parsePercentage,
	parsePercentileRange,
	removeNullValues,
} from "./helpers";

type Tables = Database["public"]["Tables"];

/**
 * Convert database errors to user-friendly messages
 */
function formatDatabaseError(error: { message: string; code?: string }, context: string): string {
	const message = error.message;

	// Handle duplicate key violations
	if (message.includes("duplicate key value violates unique constraint")) {
		if (message.includes("coaches_unique_id_key")) {
			return `${context}: A coach with this unique ID already exists`;
		}
		if (message.includes("coaches_email_key")) {
			return `${context}: A coach with this email already exists`;
		}
		if (message.includes("coaches_full_name_key")) {
			return `${context}: A coach with this name already exists`;
		}
		if (message.includes("universities_")) {
			return `${context}: A university with these details already exists`;
		}
		return `${context}: A record with these details already exists`;
	}

	// Handle foreign key violations
	if (message.includes("violates foreign key constraint")) {
		return `${context}: Referenced record not found`;
	}

	// Handle not null violations
	if (message.includes("violates not-null constraint")) {
		const match = message.match(/column "(\w+)"/);
		const column = match ? match[1].replace(/_/g, " ") : "required field";
		return `${context}: Missing required field "${column}"`;
	}

	// Default: return original message
	return `${context}: ${message}`;
}

export async function processCoachData(
	row: CoachRow,
	supabase: SupabaseClient<Database>,
): Promise<void> {
	// Validate email is present - skip coach if missing
	const email = nullifyEmptyString(row["Email address"]);
	if (!email) {
		throw new Error("Missing email address - coach record skipped");
	}

	// Step 1: Upsert University
	const university = await upsertUniversity(row, supabase);

	// Step 2: Link Division
	const divisionName = mapDivisionCode(row._division);
	await linkDivision(university.id, divisionName, supabase);

	// Step 3: Link Conference
	if (row.Conference) {
		await linkConference(university.id, row.Conference, supabase);
	}

	// Step 4: Upsert Program (Men's Track)
	const program = await upsertProgram(university.id, row, supabase);

	// Step 5: Upsert Coach
	const coach = await upsertCoach(row, university.id, program.id, supabase);

	// Step 6: Handle job changes (close old job if coach moved)
	await handleJobChange(coach.id, university.id, supabase);

	// Step 7: Create/Update University Job
	const job = await upsertUniversityJob(
		coach.id,
		university.id,
		program.id,
		row,
		supabase,
	);

	// Step 8: Create Coach Responsibilities
	if (row.Responsibilities) {
		await upsertResponsibilities(job.id, row.Responsibilities, supabase);
	}
}

async function upsertUniversity(
	row: CoachRow,
	supabase: SupabaseClient<Database>,
): Promise<Tables["universities"]["Row"]> {
	const schoolName = row.School.trim();
	const state = row.State?.trim() || null;

	// Check if university exists
	let query = supabase
		.from("universities")
		.select("*")
		.eq("name", schoolName);

	// Handle null state properly
	if (state) {
		query = query.eq("state", state);
	} else {
		query = query.is("state", null);
	}

	const { data: existing } = await query.maybeSingle();

	if (existing) {
		// Update existing university with latest data
		const satReading = parsePercentileRange(
			row["SAT-Reading (25th-75th percentile)"],
		);
		const satMath = parsePercentileRange(
			row["SAT-Math (25th-75th percentile)"],
		);
		const actComposite = parsePercentileRange(
			row["ACT composite (25th-75th percentile)"],
		);

		// Only update fields that have non-null values (prevents overriding existing data)
		const updates = removeNullValues({
			city: nullifyEmptyString(row.City),
			region: nullifyEmptyString(row.Region),
			size_of_city: nullifyEmptyString(row["Size of city"]),
			type_public_private: nullifyEmptyString(row["Private/Public"]),
			religious_affiliation: nullifyEmptyString(row["Religious affiliation?"]),
			institution_flags_raw: nullifyEmptyString(
				row["HBCU? Community College? Women only?"],
			),
			average_gpa: parseFloat(row["Average GPA"]),
			sat_ebrw_25th: satReading.min,
			sat_ebrw_75th: satReading.max,
			sat_math_25th: satMath.min,
			sat_math_75th: satMath.max,
			act_composite_25th: actComposite.min,
			act_composite_75th: actComposite.max,
			acceptance_rate_pct: parsePercentage(row["Acceptance rate"]),
			total_yearly_cost: parseInteger(
				row["Total yearly cost (in-state/out-of-state)"],
			),
			majors_offered_url: nullifyEmptyString(row["Majors offered"]),
			undergraduate_enrollment: parseInteger(row["No. of undergrads"]),
			us_news_ranking_national_2018: parseInteger(
				row["U.S. News ranking (National, 2018)"],
			),
			us_news_ranking_liberal_arts_2018: parseInteger(
				row["U.S. News ranking (national liberal arts, 2018)"],
			),
			ipeds_nces_id: nullifyEmptyString(row["IPEDS/NCES ID"]),
			updated_at: new Date().toISOString(),
		});

		const { data: updated, error } = await supabase
			.from("universities")
			.update(updates)
			.eq("id", existing.id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update university: ${error.message}`);
		return updated!;
	}

	// Create new university
	const satReading = parsePercentileRange(
		row["SAT-Reading (25th-75th percentile)"],
	);
	const satMath = parsePercentileRange(row["SAT-Math (25th-75th percentile)"]);
	const actComposite = parsePercentileRange(
		row["ACT composite (25th-75th percentile)"],
	);

	const { data: created, error } = await supabase
		.from("universities")
		.insert({
			name: schoolName,
			state,
			city: nullifyEmptyString(row.City),
			region: nullifyEmptyString(row.Region),
			size_of_city: nullifyEmptyString(row["Size of city"]),
			type_public_private: nullifyEmptyString(row["Private/Public"]),
			religious_affiliation: nullifyEmptyString(row["Religious affiliation?"]),
			institution_flags_raw: nullifyEmptyString(
				row["HBCU? Community College? Women only?"],
			),
			average_gpa: parseFloat(row["Average GPA"]),
			sat_ebrw_25th: satReading.min,
			sat_ebrw_75th: satReading.max,
			sat_math_25th: satMath.min,
			sat_math_75th: satMath.max,
			act_composite_25th: actComposite.min,
			act_composite_75th: actComposite.max,
			acceptance_rate_pct: parsePercentage(row["Acceptance rate"]),
			total_yearly_cost: parseInteger(
				row["Total yearly cost (in-state/out-of-state)"],
			),
			majors_offered_url: nullifyEmptyString(row["Majors offered"]),
			undergraduate_enrollment: parseInteger(row["No. of undergrads"]),
			us_news_ranking_national_2018: parseInteger(
				row["U.S. News ranking (National, 2018)"],
			),
			us_news_ranking_liberal_arts_2018: parseInteger(
				row["U.S. News ranking (national liberal arts, 2018)"],
			),
			ipeds_nces_id: nullifyEmptyString(row["IPEDS/NCES ID"]),
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to create university: ${error.message}`);
	return created!;
}

async function linkDivision(
	universityId: string,
	divisionName: string,
	supabase: SupabaseClient<Database>,
): Promise<void> {
	// Find or create division
	const { data: division } = await supabase
		.from("divisions")
		.select("*")
		.eq("name", divisionName)
		.maybeSingle();

	if (!division) {
		console.warn(
			`Division "${divisionName}" not found in database, skipping link`,
		);
		return;
	}

	// Check if link already exists
	const { data: existing } = await supabase
		.from("university_divisions")
		.select("*")
		.eq("university_id", universityId)
		.eq("division_id", division.id)
		.is("end_date", null) // Current division only
		.maybeSingle();

	if (!existing) {
		// Create link
		await supabase.from("university_divisions").insert({
			university_id: universityId,
			division_id: division.id,
			start_date: new Date().toISOString(),
		});
	}
}

async function linkConference(
	universityId: string,
	conferenceName: string,
	supabase: SupabaseClient<Database>,
): Promise<void> {
	const cleanName = conferenceName.trim();

	// Find conference (don't create - requires governing_body_id)
	const { data: conference } = await supabase
		.from("conferences")
		.select("*")
		.eq("name", cleanName)
		.maybeSingle();

	if (!conference) {
		// Conference doesn't exist - log and skip
		// Creating conferences requires governing_body_id which we don't have from CSV
		console.warn(`Conference "${cleanName}" not found in database, skipping link`);
		return;
	}

	// Check if link already exists
	const { data: existing } = await supabase
		.from("university_conferences")
		.select("*")
		.eq("university_id", universityId)
		.eq("conference_id", conference.id)
		.is("end_date", null)
		.maybeSingle();

	if (!existing) {
		await supabase.from("university_conferences").insert({
			university_id: universityId,
			conference_id: conference.id,
			start_date: new Date().toISOString(),
		});
	}
}

async function upsertProgram(
	universityId: string,
	row: CoachRow,
	supabase: SupabaseClient<Database>,
): Promise<Tables["programs"]["Row"]> {
	// Determine gender from Sport code field
	const sportCode = row["Sport code"]?.toLowerCase() || "";
	let gender: "men" | "women" = "men"; // Default to men if not specified

	if (sportCode.includes("women") || sportCode.includes("woman")) {
		gender = "women";
	} else if (sportCode.includes("men") || sportCode.includes("man")) {
		gender = "men";
	}

	const { data: existing } = await supabase
		.from("programs")
		.select("*")
		.eq("university_id", universityId)
		.eq("gender", gender)
		.maybeSingle();

	if (existing) {
		// Update team URLs (only non-null values)
		const updates = removeNullValues({
			team_url: nullifyEmptyString(row["Landing pages"]),
			team_instagram: nullifyEmptyString(row["Team's Instagram"]),
			team_twitter: nullifyEmptyString(row["Team's Twitter"]),
			updated_at: new Date().toISOString(),
		});

		const { data: updated, error } = await supabase
			.from("programs")
			.update(updates)
			.eq("id", existing.id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update program: ${error.message}`);
		return updated!;
	}

	// Create program
	const { data: created, error } = await supabase
		.from("programs")
		.insert({
			university_id: universityId,
			gender,
			team_url: nullifyEmptyString(row["Landing pages"]),
			team_instagram: nullifyEmptyString(row["Team's Instagram"]),
			team_twitter: nullifyEmptyString(row["Team's Twitter"]),
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to create program: ${error.message}`);
	return created!;
}

async function upsertCoach(
	row: CoachRow,
	universityId: string,
	programId: string,
	supabase: SupabaseClient<Database>,
): Promise<Tables["coaches"]["Row"]> {
	const fullName = `${row["First name"]} ${row["Last name"]}`.trim();
	const email = nullifyEmptyString(row["Email address"]);
	const phone = nullifyEmptyString(row["Phone number"]);
	const primarySpecialty = derivePrimarySpecialty(row.Responsibilities);

	// Try to find by email in coaches table first
	if (email) {
		const { data: existingByEmail } = await supabase
			.from("coaches")
			.select("*")
			.eq("email", email)
			.maybeSingle();

		if (existingByEmail) {
			// Update existing coach
			const updates = removeNullValues({
				full_name: fullName,
				phone,
				primary_specialty: primarySpecialty,
				twitter_profile: nullifyEmptyString(row["Individual's Twitter"]),
				instagram_profile: nullifyEmptyString(row["Individual's Instagram"]),
				updated_at: new Date().toISOString(),
			});

			const { data: updated, error } = await supabase
				.from("coaches")
				.update(updates)
				.eq("id", existingByEmail.id)
				.select()
				.single();

			if (error) throw new Error(formatDatabaseError(error, "Failed to update coach"));
			return updated!;
		}
	}

	// Try to find by work_email in university_jobs
	if (email) {
		const { data: existingJob } = await supabase
			.from("university_jobs")
			.select("coach_id")
			.eq("work_email", email)
			.maybeSingle();

		if (existingJob?.coach_id) {
			// Update coach record
			const updates = removeNullValues({
				full_name: fullName,
				email, // Set email on coach record
				phone,
				primary_specialty: primarySpecialty,
				twitter_profile: nullifyEmptyString(row["Individual's Twitter"]),
				instagram_profile: nullifyEmptyString(row["Individual's Instagram"]),
				updated_at: new Date().toISOString(),
			});

			const { data: updated, error } = await supabase
				.from("coaches")
				.update(updates)
				.eq("id", existingJob.coach_id)
				.select()
				.single();

			if (error) throw new Error(formatDatabaseError(error, "Failed to update coach"));
			return updated!;
		}
	}

	// Try to find by full_name with active job at this university/program
	const { data: existingJobByName } = await supabase
		.from("university_jobs")
		.select("coach_id, coaches(full_name)")
		.eq("university_id", universityId)
		.eq("program_id", programId)
		.is("end_date", null)
		.maybeSingle();

	if (existingJobByName?.coach_id && existingJobByName.coaches?.full_name === fullName) {
		// Update existing coach
		const updates = removeNullValues({
			email,
			phone,
			primary_specialty: primarySpecialty,
			twitter_profile: nullifyEmptyString(row["Individual's Twitter"]),
			instagram_profile: nullifyEmptyString(row["Individual's Instagram"]),
			updated_at: new Date().toISOString(),
		});

		const { data: updated, error } = await supabase
			.from("coaches")
			.update(updates)
			.eq("id", existingJobByName.coach_id)
			.select()
			.single();

		if (error) throw new Error(formatDatabaseError(error, "Failed to update coach"));
		return updated!;
	}

	// Create new coach
	const { data: created, error } = await supabase
		.from("coaches")
		.insert({
			full_name: fullName,
			email,
			phone,
			primary_specialty: primarySpecialty,
			twitter_profile: nullifyEmptyString(row["Individual's Twitter"]),
			instagram_profile: nullifyEmptyString(row["Individual's Instagram"]),
		})
		.select()
		.single();

	if (error) throw new Error(formatDatabaseError(error, "Failed to create coach"));
	return created!;
}

async function handleJobChange(
	coachId: string,
	newUniversityId: string,
	supabase: SupabaseClient<Database>,
): Promise<void> {
	// Find active job for this coach
	const { data: activeJob } = await supabase
		.from("university_jobs")
		.select("*")
		.eq("coach_id", coachId)
		.is("end_date", null)
		.maybeSingle();

	// If coach has an active job at a different university, close it
	if (activeJob && activeJob.university_id !== newUniversityId) {
		await supabase
			.from("university_jobs")
			.update({ end_date: new Date().toISOString() })
			.eq("id", activeJob.id);

		console.log(
			`[Data Mapper] Closed previous job for coach ${coachId} at university ${activeJob.university_id}`,
		);
	}
}

async function upsertUniversityJob(
	coachId: string,
	universityId: string,
	programId: string,
	row: CoachRow,
	supabase: SupabaseClient<Database>,
): Promise<Tables["university_jobs"]["Row"]> {
	const workEmail = nullifyEmptyString(row["Email address"]);
	const workPhone = nullifyEmptyString(row["Phone number"]);
	const jobTitle = nullifyEmptyString(row.Position) || "Coach";

	// Determine program_scope from Sport code and Position
	const sportCode = row["Sport code"]?.toLowerCase() || "";
	const position = row.Position?.toLowerCase() || "";
	let programScope: "men" | "women" | "both" | "n/a" = "men";

	// Check if director role (typically covers both)
	if (position.includes("director") || position.includes("head coach") && !sportCode) {
		programScope = "both";
	} else if (sportCode.includes("women") || sportCode.includes("woman")) {
		programScope = "women";
	} else if (sportCode.includes("men") || sportCode.includes("man")) {
		programScope = "men";
	}

	// Check if job already exists for this coach at this university
	const { data: existing } = await supabase
		.from("university_jobs")
		.select("*")
		.eq("coach_id", coachId)
		.eq("university_id", universityId)
		.is("end_date", null)
		.maybeSingle();

	if (existing) {
		// Update existing job (only non-null values)
		const updates = removeNullValues({
			program_id: programId,
			job_title: jobTitle,
			work_email: workEmail,
			work_phone: workPhone,
			program_scope: programScope,
			updated_at: new Date().toISOString(),
		});

		const { data: updated, error } = await supabase
			.from("university_jobs")
			.update(updates)
			.eq("id", existing.id)
			.select()
			.single();

		if (error)
			throw new Error(`Failed to update university job: ${error.message}`);
		return updated!;
	}

	// Create new job
	const { data: created, error } = await supabase
		.from("university_jobs")
		.insert({
			coach_id: coachId,
			university_id: universityId,
			program_id: programId,
			job_title: jobTitle,
			work_email: workEmail,
			work_phone: workPhone,
			program_scope: programScope,
			start_date:
				nullifyEmptyString(row["Hire date"]) || new Date().toISOString(),
		})
		.select()
		.single();

	if (error)
		throw new Error(`Failed to create university job: ${error.message}`);
	return created!;
}

async function upsertResponsibilities(
	universityJobId: string,
	responsibilitiesText: string,
	supabase: SupabaseClient<Database>,
): Promise<void> {
	const eventGroups = parseEventGroups(responsibilitiesText);

	if (eventGroups.length === 0) {
		// No specific responsibilities parsed, store as general/combined
		eventGroups.push("combined");
	}

	// Delete existing responsibilities for this job
	await supabase
		.from("coach_responsibilities")
		.delete()
		.eq("university_job_id", universityJobId);

	// Parse specific events to look up event_ids
	const { parseSpecificEvents } = await import("./helpers");
	const specificEvents = parseSpecificEvents(responsibilitiesText);

	// Look up event IDs for specific events mentioned
	let eventIdMap: Record<string, string> = {};
	if (specificEvents.length > 0) {
		const { data: events } = await supabase
			.from("events")
			.select("id, name")
			.in("name", specificEvents);

		if (events) {
			eventIdMap = events.reduce(
				(acc, event) => {
					if (event.name) acc[event.name] = event.id;
					return acc;
				},
				{} as Record<string, string>,
			);
		}
	}

	// Insert new responsibilities
	const inserts = eventGroups.map((eventGroup) => {
		// Try to find a matching event_id for this group
		let eventId: string | null = null;

		// Match first specific event that belongs to this event group
		for (const eventName of specificEvents) {
			if (eventIdMap[eventName]) {
				// Simple mapping of event names to groups
				const eventNameLower = eventName.toLowerCase();
				if (
					(eventGroup === "sprints" && (eventNameLower.includes("100m") || eventNameLower.includes("200m") || eventNameLower.includes("400m"))) ||
					(eventGroup === "distance" && (eventNameLower.includes("800") || eventNameLower.includes("1500") || eventNameLower.includes("3000") || eventNameLower.includes("5000") || eventNameLower.includes("10000"))) ||
					(eventGroup === "hurdles" && eventNameLower.includes("hurdle")) ||
					(eventGroup === "jumps" && (eventNameLower.includes("jump") || eventNameLower.includes("vault"))) ||
					(eventGroup === "throws" && (eventNameLower.includes("shot") || eventNameLower.includes("discus") || eventNameLower.includes("javelin") || eventNameLower.includes("hammer"))) ||
					(eventGroup === "relays" && eventNameLower.includes("relay")) ||
					(eventGroup === "combined" && (eventNameLower.includes("athlon")))
				) {
					eventId = eventIdMap[eventName];
					break;
				}
			}
		}

		return {
			university_job_id: universityJobId,
			event_group: eventGroup,
			event_id: eventId,
		};
	});

	const { error } = await supabase
		.from("coach_responsibilities")
		.insert(inserts);

	if (error) {
		console.error(`Failed to create coach responsibilities: ${error.message}`);
	}
}
