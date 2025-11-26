import { type NextRequest, NextResponse } from "next/server";

import {
	findField,
	findFileValue,
	findIntegerValue,
	findNumberValue,
	findStringValue,
	getBooleanField,
	TALLY_FIELD_MAPPINGS,
	type TallyFileUpload,
	type TallyWebhookPayload,
	verifyTallySignature,
} from "@/lib/tally-webhook";

import { createClient } from "@/utils/supabase/serviceRole";

// ============================================================================
// Constants
// ============================================================================

// Redirect URLs
const CALENDLY_URL =
	"https://calendly.com/coachmalik-thepreferredrecruit/onboarding";
const POSTER_FORM_URL = "https://tally.so/r/RGWMNl";

// Status option ID for "requested" in onboarding_call category
const ONBOARDING_CALL_REQUESTED_STATUS_ID = 23;
const ONBOARDING_CALL_CATEGORY_ID = 1;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Downloads a file from URL and returns it as a Buffer
 */
async function downloadFile(
	url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`Failed to download file from ${url}: ${response.status}`);
			return null;
		}

		const arrayBuffer = await response.arrayBuffer();
		const contentType =
			response.headers.get("content-type") || "application/octet-stream";

		return {
			buffer: Buffer.from(arrayBuffer),
			contentType,
		};
	} catch (error) {
		console.error(`Error downloading file from ${url}:`, error);
		return null;
	}
}

/**
 * Uploads a file to Supabase Storage and returns the public URL
 */
async function uploadToSupabase(
	supabase: Awaited<ReturnType<typeof createClient>>,
	athleteId: string,
	file: TallyFileUpload,
	prefix: string,
): Promise<string | null> {
	try {
		// Download the file from Tally CDN
		const downloaded = await downloadFile(file.url);
		if (!downloaded) {
			return null;
		}

		// Generate unique filename
		const extension = file.name.split(".").pop() || "jpg";
		const fileName = `${athleteId}/${prefix}-${Date.now()}.${extension}`;

		// Upload to Supabase Storage
		const { error: uploadError } = await supabase.storage
			.from("athlete-assets")
			.upload(fileName, downloaded.buffer, {
				contentType: file.mimeType || downloaded.contentType,
				cacheControl: "3600",
				upsert: true,
			});

		if (uploadError) {
			console.error("Supabase upload error:", uploadError);
			return null;
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from("athlete-assets").getPublicUrl(fileName);

		return publicUrl;
	} catch (error) {
		console.error("Error uploading to Supabase:", error);
		return null;
	}
}

// ============================================================================
// SAT/ACT Combined Field Parsing
// ============================================================================

interface ParsedTestScores {
	satScore: number | null;
	actScore: number | null;
}

/**
 * Parses combined SAT/ACT field
 * Supports formats like: "31 ACT", "1400 SAT", "31 ACT, 1400 SAT", "ACT: 31"
 */
function parseSatActCombined(text: string): ParsedTestScores {
	const result: ParsedTestScores = { satScore: null, actScore: null };
	if (!text) return result;

	const normalized = text.toLowerCase();

	// Look for ACT score (typically 1-36)
	const actPatterns = [
		/(\d{1,2})\s*act/i, // "31 ACT" or "31act"
		/act[:\s]*(\d{1,2})/i, // "ACT: 31" or "ACT 31"
	];
	for (const pattern of actPatterns) {
		const match = normalized.match(pattern);
		if (match) {
			const score = Number.parseInt(match[1], 10);
			if (score >= 1 && score <= 36) {
				result.actScore = score;
				break;
			}
		}
	}

	// Look for SAT score (typically 400-1600)
	const satPatterns = [
		/(\d{3,4})\s*sat/i, // "1400 SAT" or "1400sat"
		/sat[:\s]*(\d{3,4})/i, // "SAT: 1400" or "SAT 1400"
	];
	for (const pattern of satPatterns) {
		const match = normalized.match(pattern);
		if (match) {
			const score = Number.parseInt(match[1], 10);
			if (score >= 400 && score <= 1600) {
				result.satScore = score;
				break;
			}
		}
	}

	return result;
}

// ============================================================================
// High School Location Parsing
// ============================================================================

interface ParsedHighSchoolLocation {
	highSchool: string | null;
	city: string | null;
	state: string | null;
}

// US state abbreviations for parsing
const US_STATE_ABBREVIATIONS = new Set([
	"AL",
	"AK",
	"AZ",
	"AR",
	"CA",
	"CO",
	"CT",
	"DE",
	"FL",
	"GA",
	"HI",
	"ID",
	"IL",
	"IN",
	"IA",
	"KS",
	"KY",
	"LA",
	"ME",
	"MD",
	"MA",
	"MI",
	"MN",
	"MS",
	"MO",
	"MT",
	"NE",
	"NV",
	"NH",
	"NJ",
	"NM",
	"NY",
	"NC",
	"ND",
	"OH",
	"OK",
	"OR",
	"PA",
	"RI",
	"SC",
	"SD",
	"TN",
	"TX",
	"UT",
	"VT",
	"VA",
	"WA",
	"WV",
	"WI",
	"WY",
	"DC",
]);

/**
 * Parses "High School Name & Location" field
 * Example: "Sage Hill School, Newport Coast CA" → { highSchool: "Sage Hill School", city: "Newport Coast", state: "CA" }
 */
function parseHighSchoolLocation(text: string): ParsedHighSchoolLocation {
	const result: ParsedHighSchoolLocation = {
		highSchool: null,
		city: null,
		state: null,
	};
	if (!text) return result;

	// Try to split by comma first (School Name, City State)
	const commaParts = text.split(",").map((p) => p.trim());

	if (commaParts.length >= 2) {
		result.highSchool = commaParts[0];

		// Parse the location part (City State or City, State)
		const locationPart = commaParts.slice(1).join(", ").trim();

		// Look for state abbreviation at the end
		const words = locationPart.split(/\s+/);
		const lastWord = words[words.length - 1]?.toUpperCase();

		if (lastWord && US_STATE_ABBREVIATIONS.has(lastWord)) {
			result.state = lastWord;
			result.city = words.slice(0, -1).join(" ").replace(/,\s*$/, "") || null;
		} else {
			// No state found, treat entire location as city
			result.city = locationPart || null;
		}
	} else {
		// No comma, just use as high school name
		result.highSchool = text;
	}

	return result;
}

/**
 * Converts a label to a snake_case key for JSONB storage
 */
function labelToSnakeCase(label: string): string {
	return label
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "") // Remove special characters
		.replace(/\s+/g, "_") // Replace spaces with underscores
		.replace(/_+/g, "_") // Remove duplicate underscores
		.replace(/^_|_$/g, ""); // Remove leading/trailing underscores
}

/**
 * Gets all known field labels from TALLY_FIELD_MAPPINGS
 */
function getKnownFieldLabels(): Set<string> {
	const knownLabels = new Set<string>();
	for (const labels of Object.values(TALLY_FIELD_MAPPINGS)) {
		for (const label of labels) {
			knownLabels.add(label.toLowerCase());
		}
	}
	return knownLabels;
}

/**
 * Extracts all fields that should be stored in onboarding_form_data JSONB
 * This includes both mapped fields AND any unmapped fields (catch-all)
 */
function extractOnboardingFormData(
	fields: TallyWebhookPayload["data"]["fields"],
): Record<string, unknown> {
	const data: Record<string, unknown> = {};
	const knownLabels = getKnownFieldLabels();

	// ========================================================================
	// SECTION: Athlete Information & Branding
	// ========================================================================

	// NCAA Eligibility URL
	const ncaaUrl = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.ncaaEligibilityUrl,
	);
	if (ncaaUrl) data.ncaa_eligibility_url = ncaaUrl;

	// Intended Major
	const major = findStringValue(fields, TALLY_FIELD_MAPPINGS.intendedMajor);
	if (major) data.intended_major = major;

	// ========================================================================
	// SECTION: Current Recruiting Status
	// ========================================================================

	// Top schools / target schools
	const topSchools = findStringValue(fields, TALLY_FIELD_MAPPINGS.topSchools);
	if (topSchools) data.top_schools = topSchools;

	// Schools in contact
	const inContact = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.schoolsInContact,
	);
	if (inContact) data.schools_in_contact = inContact;

	// Schools with offers
	const withOffers = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.schoolsWithOffers,
	);
	if (withOffers) data.schools_with_offers = withOffers;

	// States NOT wanted
	const statesNot = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.statesNotWanted,
	);
	if (statesNot) data.states_not_wanted = statesNot;

	// Schools applied to
	const schoolsApplied = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.schoolsAppliedTo,
	);
	if (schoolsApplied) data.schools_applied_to = schoolsApplied;

	// Divisions willing to compete
	const divisionsField = findField(
		fields,
		TALLY_FIELD_MAPPINGS.divisionsWilling,
	);
	if (divisionsField?.value) {
		data.divisions_willing = Array.isArray(divisionsField.value)
			? divisionsField.value
			: [divisionsField.value];
	}

	// Colleges NOT wanted
	const collegesNotWanted = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.collegesNotWanted,
	);
	if (collegesNotWanted) data.colleges_not_wanted = collegesNotWanted;

	// Most important qualities
	const qualities = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.mostImportantQualities,
	);
	if (qualities) data.most_important_qualities = qualities;

	// Religious affiliation preference
	const religious = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.religiousAffiliation,
	);
	if (religious) data.religious_affiliation = religious;

	// HBCU interest
	const hbcu = findStringValue(fields, TALLY_FIELD_MAPPINGS.hbcuInterest);
	if (hbcu) data.hbcu_interest = hbcu;

	// U.S. News preference
	const usNews = findStringValue(fields, TALLY_FIELD_MAPPINGS.usNewsPreference);
	if (usNews) data.us_news_preference = usNews;

	// School size preference
	const schoolSize = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.schoolSizePreference,
	);
	if (schoolSize) data.school_size_preference = schoolSize;

	// Military academy interest
	const military = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.militaryAcademy,
	);
	if (military) data.military_academy = military;

	// Tuition budget
	const budget = findStringValue(fields, TALLY_FIELD_MAPPINGS.tuitionBudget);
	if (budget) data.tuition_budget = budget;

	// ========================================================================
	// SECTION: Athletic Background
	// ========================================================================

	// Career achievement
	const achievement = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.careerAchievement,
	);
	if (achievement) data.career_achievement = achievement;

	// ========================================================================
	// SECTION: Work Ethic & Character
	// ========================================================================

	// Work ethic & character blurb
	const workEthic = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.workEthicBlurb,
	);
	if (workEthic) data.work_ethic_blurb = workEthic;

	// ========================================================================
	// SECTION: Personal Story / Differentiator
	// ========================================================================

	// Challenges overcome
	const challenges = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.challengesOvercome,
	);
	if (challenges) data.challenges_overcome = challenges;

	// Personal story / differentiator
	const story = findStringValue(fields, TALLY_FIELD_MAPPINGS.personalStory);
	if (story) data.personal_story = story;

	// Ultimate goal
	const goal = findStringValue(fields, TALLY_FIELD_MAPPINGS.ultimateGoal);
	if (goal) data.ultimate_goal = goal;

	// Team environment preference
	const teamEnv = findStringValue(fields, TALLY_FIELD_MAPPINGS.teamEnvironment);
	if (teamEnv) data.team_environment = teamEnv;

	// Coaching style preference
	const coachingStyle = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.coachingStylePreference,
	);
	if (coachingStyle) data.coaching_style_preference = coachingStyle;

	// Additional info
	const additional = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.additionalInfo,
	);
	if (additional) data.additional_info = additional;

	// ========================================================================
	// SECTION: Personal Records
	// ========================================================================

	// Personal records (raw text)
	const prs = findStringValue(fields, TALLY_FIELD_MAPPINGS.personalRecords);
	if (prs) data.personal_records_raw = prs;

	// ========================================================================
	// SECTION: Poster Form Fields (if included)
	// ========================================================================

	// Events & times for poster
	const posterEvents = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.posterEventsTimes,
	);
	if (posterEvents) data.poster_events_times = posterEvents;

	// Poster standout info
	const posterStandout = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.posterStandoutInfo,
	);
	if (posterStandout) data.poster_standout_info = posterStandout;

	// Poster school preferences
	const posterPrefs = findStringValue(
		fields,
		TALLY_FIELD_MAPPINGS.posterSchoolPreferences,
	);
	if (posterPrefs) data.poster_school_preferences = posterPrefs;

	// ========================================================================
	// SYSTEM FIELDS
	// ========================================================================

	// Store needs_poster for redirect logic
	const needsPoster = getBooleanField(fields, "Do you need poster");
	if (needsPoster !== null) data.needs_poster = needsPoster;

	// ========================================================================
	// CATCH-ALL: Store any unmapped fields
	// This ensures new fields added to the Tally form are automatically captured
	// ========================================================================

	const unmappedFields: Record<string, unknown> = {};

	for (const field of fields) {
		const labelLower = field.label.toLowerCase();
		const keyLower = field.key.toLowerCase();

		// Skip if this field is already mapped (known label or key)
		if (knownLabels.has(labelLower) || knownLabels.has(keyLower)) {
			continue;
		}

		// Skip empty values
		if (
			field.value === null ||
			field.value === undefined ||
			field.value === ""
		) {
			continue;
		}

		// Skip file upload fields (handled separately)
		if (
			Array.isArray(field.value) &&
			field.value.length > 0 &&
			typeof field.value[0] === "object" &&
			field.value[0] !== null &&
			"url" in field.value[0]
		) {
			continue;
		}

		// Convert label to snake_case key
		const snakeKey = labelToSnakeCase(field.label);
		if (!snakeKey) continue;

		// Store the unmapped field
		unmappedFields[snakeKey] = {
			label: field.label,
			value: field.value,
			type: field.type,
		};

		console.log(
			`[Tally Webhook] Captured unmapped field "${field.label}" → ${snakeKey}`,
		);
	}

	// Add unmapped fields to the data object under a special key
	if (Object.keys(unmappedFields).length > 0) {
		data.unmapped_fields = unmappedFields;
		console.log(
			`[Tally Webhook] Total unmapped fields captured: ${Object.keys(unmappedFields).length}`,
		);
	}

	return data;
}

// ============================================================================
// Personal Records Parsing
// ============================================================================

// Event code mappings for common variations
const EVENT_CODE_MAPPINGS: Record<string, string> = {
	"100": "100m",
	"100m": "100m",
	"200": "200m",
	"200m": "200m",
	"400": "400m",
	"400m": "400m",
	"800": "800m",
	"800m": "800m",
	"1500": "1500m",
	"1500m": "1500m",
	"1600": "mile",
	"1600m": "mile",
	mile: "mile",
	"3200": "2mile",
	"3200m": "2mile",
	"2mile": "2mile",
	"5000": "5000m",
	"5000m": "5000m",
	"5k": "5000m",
	"10000": "10000m",
	"10000m": "10000m",
	"10k": "10000m",
	"55m": "55m",
	"60m": "60m",
	"300m": "300m",
	"300": "300m",
	"600m": "600m",
	"600": "600m",
	"1000m": "1000m",
	"1000": "1000m",
	"3000m": "3000m",
	"3000": "3000m",
	// Hurdles
	"100mh": "100mH",
	"100h": "100mH",
	"110mh": "110mH",
	"110h": "110mH",
	"300mh": "300mH",
	"300h": "300mH",
	"400mh": "400mH",
	"400h": "400mH",
	// Field events
	hj: "HJ",
	"high jump": "HJ",
	pv: "PV",
	"pole vault": "PV",
	lj: "LJ",
	"long jump": "LJ",
	tj: "TJ",
	"triple jump": "TJ",
	sp: "SP",
	"shot put": "SP",
	dt: "DT",
	discus: "DT",
	jt: "JT",
	javelin: "JT",
	ht: "HT",
	hammer: "HT",
};

interface ParsedPR {
	eventCode: string;
	mark: string;
}

/**
 * Parses personal records from free-form text
 * Supports formats like:
 * - "10.75 100m; 22.11 200m"
 * - "100m: 10.75, 200m: 22.11"
 * - "100m - 10.75 / 200m - 22.11"
 */
function parsePersonalRecords(prText: string): ParsedPR[] {
	const results: ParsedPR[] = [];
	if (!prText) return results;

	// Normalize separators
	const normalized = prText
		.toLowerCase()
		.replace(/\n/g, ";")
		.replace(/\//g, ";")
		.replace(/,/g, ";");

	// Split by common delimiters
	const parts = normalized.split(";").map((p) => p.trim());

	for (const part of parts) {
		if (!part) continue;

		// Try different patterns

		// Pattern 1: "10.75 100m" or "10.75 100"
		const pattern1 = part.match(
			/^(\d+[:.]\d+|\d+)\s*(?:seconds?\s+)?(\d+m?|mile|[a-z]+(?:\s+[a-z]+)?)/i,
		);
		if (pattern1) {
			const [, mark, event] = pattern1;
			const eventCode = EVENT_CODE_MAPPINGS[event.toLowerCase()];
			if (eventCode) {
				results.push({ eventCode, mark: mark.replace(":", ".") });
				continue;
			}
		}

		// Pattern 2: "100m: 10.75" or "100m - 10.75"
		const pattern2 = part.match(
			/^(\d+m?|mile|[a-z]+(?:\s+[a-z]+)?)\s*[:\-–]\s*(\d+[:.]\d+|\d+)/i,
		);
		if (pattern2) {
			const [, event, mark] = pattern2;
			const eventCode = EVENT_CODE_MAPPINGS[event.toLowerCase()];
			if (eventCode) {
				results.push({ eventCode, mark: mark.replace(":", ".") });
				continue;
			}
		}

		// Pattern 3: Just look for event name and time in any order
		const eventMatch = part.match(
			/(\d+m?|mile|high\s*jump|long\s*jump|triple\s*jump|pole\s*vault|shot\s*put|discus|javelin|hammer)/i,
		);
		const timeMatch = part.match(/(\d+[:.]\d+)/);
		if (eventMatch && timeMatch) {
			const eventCode = EVENT_CODE_MAPPINGS[eventMatch[1].toLowerCase()];
			if (eventCode) {
				results.push({ eventCode, mark: timeMatch[1].replace(":", ".") });
			}
		}
	}

	return results;
}

/**
 * Inserts athlete results into the database
 */
async function insertAthleteResults(
	supabase: Awaited<ReturnType<typeof createClient>>,
	athleteId: string,
	prText: string,
): Promise<number> {
	const parsedPRs = parsePersonalRecords(prText);
	if (parsedPRs.length === 0) {
		console.log("[Tally Webhook] No personal records could be parsed");
		return 0;
	}

	console.log(
		`[Tally Webhook] Parsed ${parsedPRs.length} personal records:`,
		parsedPRs,
	);

	// Get event IDs for the parsed events
	const eventCodes = [...new Set(parsedPRs.map((pr) => pr.eventCode))];
	const { data: events, error: eventsError } = await supabase
		.from("events")
		.select("id, code")
		.in("code", eventCodes);

	if (eventsError || !events) {
		console.error("[Tally Webhook] Error fetching events:", eventsError);
		return 0;
	}

	const eventMap = new Map(events.map((e) => [e.code, e.id]));

	// Insert results
	let insertedCount = 0;
	for (const pr of parsedPRs) {
		const eventId = eventMap.get(pr.eventCode);
		if (!eventId) {
			console.log(`[Tally Webhook] Event not found for code: ${pr.eventCode}`);
			continue;
		}

		// Check if result already exists for this athlete/event
		const { data: existing } = await supabase
			.from("athlete_results")
			.select("id")
			.eq("athlete_id", athleteId)
			.eq("event_id", eventId)
			.single();

		if (existing) {
			// Update existing result
			const { error } = await supabase
				.from("athlete_results")
				.update({ performance_mark: pr.mark })
				.eq("id", existing.id);

			if (!error) {
				insertedCount++;
				console.log(
					`[Tally Webhook] Updated result for ${pr.eventCode}: ${pr.mark}`,
				);
			}
		} else {
			// Insert new result
			const { error } = await supabase.from("athlete_results").insert({
				athlete_id: athleteId,
				event_id: eventId,
				performance_mark: pr.mark,
				internal_notes: "Added from onboarding form",
			});

			if (!error) {
				insertedCount++;
				console.log(
					`[Tally Webhook] Inserted result for ${pr.eventCode}: ${pr.mark}`,
				);
			} else {
				console.error(
					`[Tally Webhook] Error inserting result for ${pr.eventCode}:`,
					error,
				);
			}
		}
	}

	return insertedCount;
}

// ============================================================================
// School Matching & Applications
// ============================================================================

/**
 * Searches for universities by name (fuzzy match)
 */
async function findUniversityByName(
	supabase: Awaited<ReturnType<typeof createClient>>,
	schoolName: string,
): Promise<string | null> {
	if (!schoolName || schoolName.trim().length < 3) return null;

	const searchTerm = schoolName.trim().toLowerCase();

	// Try exact match first
	const { data: exactMatch } = await supabase
		.from("universities")
		.select("id")
		.ilike("name", searchTerm)
		.limit(1)
		.single();

	if (exactMatch) return exactMatch.id;

	// Try partial match
	const { data: partialMatch } = await supabase
		.from("universities")
		.select("id")
		.ilike("name", `%${searchTerm}%`)
		.limit(1)
		.single();

	if (partialMatch) return partialMatch.id;

	return null;
}

/**
 * Parses school names from free-form text
 */
function parseSchoolNames(text: string): string[] {
	if (!text) return [];

	// Split by common delimiters and clean up
	return text
		.split(/[,;\n/]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 2);
}

type ApplicationStage =
	| "intro"
	| "ongoing"
	| "visit"
	| "offer"
	| "committed"
	| "dropped";

/**
 * Creates athlete applications for schools mentioned
 */
async function createAthleteApplications(
	supabase: Awaited<ReturnType<typeof createClient>>,
	athleteId: string,
	schoolsText: string,
	stage: ApplicationStage,
): Promise<number> {
	const schoolNames = parseSchoolNames(schoolsText);
	if (schoolNames.length === 0) return 0;

	console.log(
		`[Tally Webhook] Processing ${schoolNames.length} schools for stage "${stage}":`,
		schoolNames,
	);

	let createdCount = 0;
	for (const schoolName of schoolNames) {
		const universityId = await findUniversityByName(supabase, schoolName);

		if (!universityId) {
			console.log(
				`[Tally Webhook] University not found: "${schoolName}" - skipping`,
			);
			continue;
		}

		// Check if application already exists
		const { data: existing } = await supabase
			.from("athlete_applications")
			.select("id")
			.eq("athlete_id", athleteId)
			.eq("university_id", universityId)
			.single();

		if (existing) {
			console.log(
				`[Tally Webhook] Application already exists for "${schoolName}"`,
			);
			continue;
		}

		// Create new application
		const applicationData: {
			athlete_id: string;
			university_id: string;
			stage: ApplicationStage;
			start_date: string;
			internal_notes: string;
			offer_date?: string;
		} = {
			athlete_id: athleteId,
			university_id: universityId,
			stage,
			start_date: new Date().toISOString(),
			internal_notes: `Added from onboarding form (${stage})`,
		};

		// Add offer_date if stage is "offer"
		if (stage === "offer") {
			applicationData.offer_date = new Date().toISOString();
		}

		const { error } = await supabase
			.from("athlete_applications")
			.insert(applicationData);

		if (!error) {
			createdCount++;
			console.log(
				`[Tally Webhook] Created application for "${schoolName}" with stage "${stage}"`,
			);
		} else {
			console.error(
				`[Tally Webhook] Error creating application for "${schoolName}":`,
				error,
			);
		}
	}

	return createdCount;
}

/**
 * Creates a school lead list with target schools
 */
async function createSchoolLeadList(
	supabase: Awaited<ReturnType<typeof createClient>>,
	athleteId: string,
	targetSchoolsText: string,
): Promise<{ listId: string | null; entriesCount: number }> {
	const schoolNames = parseSchoolNames(targetSchoolsText);
	if (schoolNames.length === 0) return { listId: null, entriesCount: 0 };

	console.log(
		`[Tally Webhook] Creating lead list with ${schoolNames.length} target schools:`,
		schoolNames,
	);

	// Create the lead list
	const { data: leadList, error: listError } = await supabase
		.from("school_lead_lists")
		.insert({
			athlete_id: athleteId,
			name: "Self-Reported Targets",
			type: "target",
			priority: 1,
			internal_notes: "Created from onboarding form",
			created_at: new Date().toISOString(),
		})
		.select("id")
		.single();

	if (listError || !leadList) {
		console.error("[Tally Webhook] Error creating lead list:", listError);
		return { listId: null, entriesCount: 0 };
	}

	// Add entries for each school
	let entriesCount = 0;
	for (const schoolName of schoolNames) {
		const universityId = await findUniversityByName(supabase, schoolName);

		if (!universityId) {
			console.log(
				`[Tally Webhook] University not found for lead list: "${schoolName}" - skipping`,
			);
			continue;
		}

		const { error } = await supabase.from("school_lead_list_entries").insert({
			school_lead_list_id: leadList.id,
			university_id: universityId,
			status: "included",
			priority: "high",
			added_at: new Date().toISOString(),
			internal_notes: "Self-reported target from onboarding form",
		});

		if (!error) {
			entriesCount++;
			console.log(`[Tally Webhook] Added "${schoolName}" to lead list`);
		}
	}

	return { listId: leadList.id, entriesCount };
}

// ============================================================================
// Webhook Handler
// ============================================================================

export async function POST(request: NextRequest) {
	const startTime = Date.now();

	try {
		// Get the raw body for signature verification
		const rawBody = await request.text();

		// Verify webhook signature
		const signature = request.headers.get("Tally-Signature");
		const signingSecret = process.env.TALLY_ATHLETE_KICKOFF_WEBHOOK_SIGNING_SECRET;

		if (!signingSecret) {
			console.error(
				"Missing TALLY_ATHLETE_KICKOFF_WEBHOOK_SIGNING_SECRET environment variable",
			);
			return NextResponse.json(
				{ error: "Webhook not configured" },
				{ status: 500 },
			);
		}

		if (!signature) {
			console.error("Missing Tally-Signature header");
			return NextResponse.json({ error: "Missing signature" }, { status: 401 });
		}

		if (!verifyTallySignature(rawBody, signature, signingSecret)) {
			console.error("Invalid Tally signature");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// Parse the payload
		const payload = JSON.parse(rawBody);

		// DEBUG MODE: Just log the payload and return immediately
		console.log("=".repeat(80));
		console.log("[Tally Webhook DEBUG] RAW PAYLOAD:");
		console.log("=".repeat(80));
		console.log(JSON.stringify(payload, null, 2));
		console.log("=".repeat(80));

		return NextResponse.json({
			success: true,
			message: "DEBUG MODE: Payload logged, no processing done",
			payload,
		});

		/* DISABLED FOR DEBUG - Uncomment when ready to process
		console.log(
			`[Tally Webhook] Received submission ${payload.data.submissionId} for form "${payload.data.formName}"`,
		);

		// Log full payload for debugging (remove in production)
		console.log(
			"[Tally Webhook] Full payload:",
			JSON.stringify(payload, null, 2),
		);

		// Log all fields with their labels and values
		console.log("[Tally Webhook] Fields received:");
		for (const field of payload.data.fields) {
			console.log(
				`  - "${field.label}" (${field.type}): ${JSON.stringify(field.value)}`,
			);
		}

		// Extract fields
		const { fields } = payload.data;
		const tallySubmissionId = payload.data.submissionId;

		// Check if this is an update (submission_id hidden field present)
		const existingSubmissionId = findStringValue(
			fields,
			TALLY_FIELD_MAPPINGS.submissionId,
		);

		// Initialize Supabase client
		const supabase = await createClient();

		// Check if athlete already exists (for updates)
		let existingAthlete: { id: string } | null = null;
		if (existingSubmissionId) {
			const { data } = await supabase
				.from("athletes")
				.select("id")
				.eq("tally_submission_id", existingSubmissionId)
				.single();
			existingAthlete = data;
		}

		// Extract core athlete fields
		const fullName = findStringValue(fields, TALLY_FIELD_MAPPINGS.fullName);

		if (!fullName) {
			console.error("Missing required field: Full Name");
			return NextResponse.json(
				{ error: "Missing required field: Full Name" },
				{ status: 400 },
			);
		}

		// Build athlete record
		const athleteData: Record<string, unknown> = {
			full_name: fullName,
			tally_submission_id: tallySubmissionId,
			updated_at: new Date().toISOString(),
		};

		// Optional core fields
		const graduationYear = findIntegerValue(
			fields,
			TALLY_FIELD_MAPPINGS.graduationYear,
		);
		if (graduationYear) athleteData.graduation_year = graduationYear;

		const gpa = findNumberValue(fields, TALLY_FIELD_MAPPINGS.gpa);
		if (gpa) athleteData.gpa = gpa;

		// Try separate ACT/SAT fields first, then fall back to combined field
		let actScore = findIntegerValue(fields, TALLY_FIELD_MAPPINGS.actScore);
		let satScore = findIntegerValue(fields, TALLY_FIELD_MAPPINGS.satScore);

		// If separate fields are empty, try parsing the combined SAT/ACT field
		if (!actScore && !satScore) {
			const satActCombined = findStringValue(
				fields,
				TALLY_FIELD_MAPPINGS.satActCombined,
			);
			if (satActCombined) {
				const parsed = parseSatActCombined(satActCombined);
				actScore = parsed.actScore;
				satScore = parsed.satScore;
				console.log(
					`[Tally Webhook] Parsed SAT/ACT from combined field: ACT=${actScore}, SAT=${satScore}`,
				);
			}
		}
		if (actScore) athleteData.act_score = actScore;
		if (satScore) athleteData.sat_score = satScore;

		// Try to parse combined high school location field
		const highSchoolLocationRaw = findStringValue(
			fields,
			TALLY_FIELD_MAPPINGS.highSchoolLocation,
		);
		if (highSchoolLocationRaw) {
			const parsedLocation = parseHighSchoolLocation(highSchoolLocationRaw);
			if (parsedLocation.highSchool)
				athleteData.high_school = parsedLocation.highSchool;
			if (parsedLocation.city) athleteData.city = parsedLocation.city;
			if (parsedLocation.state) athleteData.state = parsedLocation.state;
			console.log(
				`[Tally Webhook] Parsed high school location: ${JSON.stringify(parsedLocation)}`,
			);
		}

		const instagramHandle = findStringValue(
			fields,
			TALLY_FIELD_MAPPINGS.instagramHandle,
		);
		if (instagramHandle) {
			// Clean up Instagram handle (remove @ if present)
			athleteData.instagram_handle = instagramHandle.replace(/^@/, "");
		}

		const highlightUrl = findStringValue(
			fields,
			TALLY_FIELD_MAPPINGS.highlightVideoUrl,
		);
		if (highlightUrl) athleteData.google_drive_folder_url = highlightUrl;

		const email = findStringValue(fields, TALLY_FIELD_MAPPINGS.email);
		if (email) athleteData.contact_email = email.toLowerCase();

		const phone = findStringValue(fields, TALLY_FIELD_MAPPINGS.phone);
		if (phone) athleteData.phone = phone;

		// Extract onboarding form data (JSONB)
		const onboardingFormData = extractOnboardingFormData(fields);
		if (Object.keys(onboardingFormData).length > 0) {
			athleteData.onboarding_form_data = onboardingFormData;
		}

		// Insert or update athlete
		let athleteId: string;

		if (existingAthlete) {
			// Update existing athlete
			const { error: updateError } = await supabase
				.from("athletes")
				.update(athleteData)
				.eq("id", existingAthlete.id);

			if (updateError) {
				console.error("Error updating athlete:", updateError);
				return NextResponse.json(
					{ error: "Failed to update athlete" },
					{ status: 500 },
				);
			}

			athleteId = existingAthlete.id;
			console.log(`[Tally Webhook] Updated athlete ${athleteId}`);
		} else {
			// Insert new athlete
			athleteData.created_at = new Date().toISOString();

			const { data: newAthlete, error: insertError } = await supabase
				.from("athletes")
				.insert(athleteData)
				.select("id")
				.single();

			if (insertError || !newAthlete) {
				console.error("Error inserting athlete:", insertError);
				return NextResponse.json(
					{ error: "Failed to create athlete" },
					{ status: 500 },
				);
			}

			athleteId = newAthlete.id;
			console.log(`[Tally Webhook] Created new athlete ${athleteId}`);
		}

		// Handle poster image uploads
		const posterUrls: {
			poster_primary_url?: string;
			poster_image_2_url?: string;
			poster_image_3_url?: string;
		} = {};

		const primaryImages = findFileValue(
			fields,
			TALLY_FIELD_MAPPINGS.posterPrimary,
		);
		if (primaryImages.length > 0) {
			const url = await uploadToSupabase(
				supabase,
				athleteId,
				primaryImages[0],
				"poster-primary",
			);
			if (url) posterUrls.poster_primary_url = url;
		}

		const secondaryImages = findFileValue(
			fields,
			TALLY_FIELD_MAPPINGS.posterImage2,
		);
		if (secondaryImages.length > 0) {
			const url = await uploadToSupabase(
				supabase,
				athleteId,
				secondaryImages[0],
				"poster-2",
			);
			if (url) posterUrls.poster_image_2_url = url;
		}

		const tertiaryImages = findFileValue(
			fields,
			TALLY_FIELD_MAPPINGS.posterImage3,
		);
		if (tertiaryImages.length > 0) {
			const url = await uploadToSupabase(
				supabase,
				athleteId,
				tertiaryImages[0],
				"poster-3",
			);
			if (url) posterUrls.poster_image_3_url = url;
		}

		// Update athlete with poster URLs if any were uploaded
		if (Object.keys(posterUrls).length > 0) {
			const { error: posterUpdateError } = await supabase
				.from("athletes")
				.update(posterUrls)
				.eq("id", athleteId);

			if (posterUpdateError) {
				console.error("Error updating poster URLs:", posterUpdateError);
				// Don't fail the whole request for poster upload errors
			} else {
				console.log(
					`[Tally Webhook] Updated poster URLs for athlete ${athleteId}`,
				);
			}
		}

		// ========================================================================
		// Process Personal Records, Applications, and Lead Lists
		// ========================================================================

		// Track additional processing results for response
		const processingResults = {
			personalRecordsInserted: 0,
			applicationsCreated: 0,
			leadListEntries: 0,
		};

		// Insert personal records from onboarding form data
		const personalRecordsRaw = onboardingFormData.personal_records_raw as
			| string
			| undefined;
		if (personalRecordsRaw) {
			processingResults.personalRecordsInserted = await insertAthleteResults(
				supabase,
				athleteId,
				personalRecordsRaw,
			);
		}

		// Create athlete applications for schools in contact (stage: "ongoing")
		const schoolsInContact = onboardingFormData.schools_in_contact as
			| string
			| undefined;
		if (schoolsInContact) {
			const ongoingCount = await createAthleteApplications(
				supabase,
				athleteId,
				schoolsInContact,
				"ongoing",
			);
			processingResults.applicationsCreated += ongoingCount;
		}

		// Create athlete applications for schools with offers (stage: "offer")
		const schoolsWithOffers = onboardingFormData.schools_with_offers as
			| string
			| undefined;
		if (schoolsWithOffers) {
			const offerCount = await createAthleteApplications(
				supabase,
				athleteId,
				schoolsWithOffers,
				"offer",
			);
			processingResults.applicationsCreated += offerCount;
		}

		// Create school lead list for target schools
		const topSchools = onboardingFormData.top_schools as string | undefined;
		if (topSchools) {
			const { entriesCount } = await createSchoolLeadList(
				supabase,
				athleteId,
				topSchools,
			);
			processingResults.leadListEntries = entriesCount;
		}

		console.log(
			"[Tally Webhook] Additional processing results:",
			processingResults,
		);

		// ========================================================================
		// Set Onboarding Call Status
		// ========================================================================

		// Set onboarding call status to "requested" (only for new athletes)
		if (!existingAthlete) {
			// Check if status already exists
			const { data: existingStatus } = await supabase
				.from("entity_status_values")
				.select("id")
				.eq("entity_type", "athlete")
				.eq("entity_id", athleteId)
				.eq("status_category_id", ONBOARDING_CALL_CATEGORY_ID)
				.single();

			if (!existingStatus) {
				const { error: statusError } = await supabase
					.from("entity_status_values")
					.insert({
						entity_type: "athlete",
						entity_id: athleteId,
						status_category_id: ONBOARDING_CALL_CATEGORY_ID,
						status_option_id: ONBOARDING_CALL_REQUESTED_STATUS_ID,
						set_at: new Date().toISOString(),
					});

				if (statusError) {
					console.error("Error setting onboarding status:", statusError);
					// Don't fail the whole request for status errors
				} else {
					console.log(
						`[Tally Webhook] Set onboarding_call status to "requested" for athlete ${athleteId}`,
					);
				}
			}
		}

		// Determine redirect URL based on poster need
		const needsPoster = getBooleanField(fields, "Do you need poster");
		let redirectUrl: string;

		if (needsPoster) {
			// Redirect to poster form with athleteId parameter
			const posterUrl = new URL(POSTER_FORM_URL);
			posterUrl.searchParams.set("athleteId", athleteId);
			redirectUrl = posterUrl.toString();
		} else {
			// Redirect to Calendly
			redirectUrl = CALENDLY_URL;
		}

		const duration = Date.now() - startTime;
		console.log(
			`[Tally Webhook] Completed processing in ${duration}ms for athlete ${athleteId}`,
		);
		console.log(
			`[Tally Webhook] Redirect: ${needsPoster ? "Poster form" : "Calendly"}`,
		);

		// Return success with redirect URL
		return NextResponse.json({
			success: true,
			athleteId,
			isUpdate: !!existingAthlete,
			needsPoster,
			processing: processingResults,
			duration: `${duration}ms`,
			redirectUrl,
		});
		// END DISABLED FOR DEBUG */
	} catch (error) {
		console.error("[Tally Webhook] Error:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

/**
 * GET handler - returns webhook info for documentation
 */
export async function GET() {
	return NextResponse.json({
		name: "Tally Onboarding Webhook",
		description:
			"Receives athlete onboarding form submissions from Tally and stores them in Supabase",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Tally-Signature": "HMAC-SHA256 signature of the payload",
		},
		actions: [
			"Verifies webhook signature",
			"Creates or updates athlete record",
			"Downloads and re-uploads poster images to Supabase Storage",
			"Sets onboarding call status to 'requested'",
			"Returns conditional redirect URL based on poster need",
		],
		redirectUrls: {
			needsPoster: `${POSTER_FORM_URL}?athleteId={athleteId}`,
			noPoster: CALENDLY_URL,
		},
		note: "Redirect URL is returned in response.redirectUrl field",
	});
}
