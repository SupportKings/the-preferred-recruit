import crypto from "node:crypto";

/**
 * Tally Webhook Types and Utilities
 *
 * Documentation: https://tally.so/help/webhooks
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface TallyFileUpload {
	id: string;
	name: string;
	url: string; // https://storage.googleapis.com/...
	mimeType: string;
	size: number;
}

export interface TallyField {
	key: string;
	label: string;
	type: string;
	value:
		| string
		| number
		| boolean
		| string[]
		| TallyFileUpload[]
		| null
		| undefined;
}

export interface TallyWebhookPayload {
	eventId: string;
	eventType: "FORM_RESPONSE";
	createdAt: string;
	data: {
		responseId: string;
		submissionId: string;
		respondentId: string;
		formId: string;
		formName: string;
		createdAt: string;
		fields: TallyField[];
	};
}

// ============================================================================
// Signature Verification
// ============================================================================

/**
 * Verifies the Tally webhook signature using HMAC-SHA256
 *
 * @param payload - The raw request body as a string
 * @param signature - The value from the Tally-Signature header
 * @param secret - Your webhook signing secret from Tally
 * @returns true if signature is valid, false otherwise
 */
export function verifyTallySignature(
	payload: string,
	signature: string,
	secret: string,
): boolean {
	try {
		const calculated = crypto
			.createHmac("sha256", secret)
			.update(payload)
			.digest("base64");

		// Use timing-safe comparison to prevent timing attacks
		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(calculated),
		);
	} catch {
		return false;
	}
}

// ============================================================================
// Field Extraction Helpers
// ============================================================================

/**
 * Gets a field value by its key or label
 */
export function getFieldValue(
	fields: TallyField[],
	keyOrLabel: string,
): TallyField["value"] {
	const field = fields.find(
		(f) =>
			f.key.toLowerCase() === keyOrLabel.toLowerCase() ||
			f.label.toLowerCase() === keyOrLabel.toLowerCase(),
	);
	return field?.value;
}

/**
 * Gets a string field value
 */
export function getStringField(
	fields: TallyField[],
	keyOrLabel: string,
): string | null {
	const value = getFieldValue(fields, keyOrLabel);
	if (typeof value === "string") {
		return value.trim() || null;
	}
	if (typeof value === "number") {
		return String(value);
	}
	return null;
}

/**
 * Gets a number field value
 */
export function getNumberField(
	fields: TallyField[],
	keyOrLabel: string,
): number | null {
	const value = getFieldValue(fields, keyOrLabel);
	if (typeof value === "number") {
		return value;
	}
	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
}

/**
 * Gets an integer field value
 */
export function getIntegerField(
	fields: TallyField[],
	keyOrLabel: string,
): number | null {
	const value = getFieldValue(fields, keyOrLabel);
	if (typeof value === "number") {
		return Math.round(value);
	}
	if (typeof value === "string") {
		const parsed = Number.parseInt(value, 10);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
}

/**
 * Gets an array field value (for checkboxes, multi-select, etc.)
 */
export function getArrayField(
	fields: TallyField[],
	keyOrLabel: string,
): string[] {
	const value = getFieldValue(fields, keyOrLabel);
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === "string");
	}
	if (typeof value === "string") {
		return [value];
	}
	return [];
}

/**
 * Gets file upload field values
 */
export function getFileField(
	fields: TallyField[],
	keyOrLabel: string,
): TallyFileUpload[] {
	const value = getFieldValue(fields, keyOrLabel);
	if (Array.isArray(value)) {
		return value.filter(
			(v): v is TallyFileUpload =>
				typeof v === "object" && v !== null && "url" in v && "mimeType" in v,
		);
	}
	return [];
}

/**
 * Gets a boolean field value (for yes/no questions)
 */
export function getBooleanField(
	fields: TallyField[],
	keyOrLabel: string,
): boolean | null {
	const value = getFieldValue(fields, keyOrLabel);
	if (typeof value === "boolean") {
		return value;
	}
	if (typeof value === "string") {
		const lower = value.toLowerCase();
		if (lower === "yes" || lower === "true" || lower === "1") {
			return true;
		}
		if (lower === "no" || lower === "false" || lower === "0") {
			return false;
		}
	}
	return null;
}

// ============================================================================
// Field Mapping Constants
// ============================================================================

/**
 * Mapping of Tally form field labels to athlete database columns
 * Based on "Preferred Recruit Athlete Evaluation Form"
 */
export const TALLY_FIELD_MAPPINGS = {
	// ========================================================================
	// SECTION: Athlete Information & Branding
	// ========================================================================

	// Full Name → athletes.full_name
	fullName: ["Full Name", "full_name", "name"],

	// Graduation Year → athletes.graduation_year
	graduationYear: ["Graduation Year", "graduation_year", "grad_year"],

	// Cumulative Highschool GPA → athletes.gpa
	gpa: ["Cumulative Highschool GPA", "Cumulative GPA", "GPA", "gpa"],

	// SAT/ACT (if taken) → Parse to athletes.sat_score and/or athletes.act_score
	// Example: "31 ACT" or "1400 SAT" or "31 ACT, 1400 SAT"
	satActCombined: ["SAT/ACT (if taken)", "SAT/ACT", "sat_act"],
	actScore: ["ACT", "ACT Score", "act_score"],
	satScore: ["SAT", "SAT Score", "sat_score"],

	// High School Name & Location → athletes.high_school, athletes.city, athletes.state
	// Example: "Sage Hill School, Newport Coast CA"
	highSchoolLocation: [
		"High School Name & Location",
		"High School Name",
		"High School",
		"high_school",
	],

	// List every Personal Record → athlete_results table + onboarding_form_data.personal_records_raw
	// Example: "10.75 100m; 22.11 200m"
	personalRecords: [
		"List every Personal Record to the .001 or CM/Inch (by event)",
		"Personal Records",
		"PRs",
		"Times",
	],

	// Highlight Video / Google Drive Link → athletes.google_drive_folder_url
	highlightVideoUrl: [
		"Highlight Video / Google Drive Link (transcripts + videos folder)",
		"Highlight Video",
		"Google Drive Link",
		"Drive Link",
		"google_drive_folder_url",
	],

	// Instagram Handle → athletes.instagram_handle
	instagramHandle: ["Instagram Handle", "Instagram", "instagram_handle"],

	// NCAA Eligibility # → onboarding_form_data.ncaa_eligibility_url
	ncaaEligibilityUrl: [
		"NCAA Eligibility #",
		"NCAA Eligibility",
		"NCAA Eligibility URL",
	],

	// Intended Major → onboarding_form_data.intended_major
	intendedMajor: ["Intended Major", "Major"],

	// ========================================================================
	// SECTION: Current Recruiting Status
	// ========================================================================

	// Top Schools You're Interested In → school_lead_lists + onboarding_form_data.top_schools
	topSchools: [
		"Top Schools You're Interested In Right Now",
		"Top schools interested in",
		"Target schools",
	],

	// Schools You're Already in Contact With → athlete_applications (stage: ongoing)
	schoolsInContact: [
		"Schools You're Already in Contact With (be very specific and write out whole name of school, if not we might accidentally re email a current school, AND THATS VERY AWKWARD)",
		"Schools You're Already in Contact With",
		"Schools already in contact",
		"Schools in contact",
	],

	// Schools You Have Received OFFICIAL Offers From → athlete_applications (stage: offer)
	schoolsWithOffers: [
		"Schools You Have Received OFFICIAL Offers From",
		"Schools with OFFICIAL offers",
		"Official offers",
	],

	// States You Do NOT Want → onboarding_form_data.states_not_wanted
	statesNotWanted: [
		"States You Do NOT Want to Attend School In (please look at a US map and be VERY specific, we will remove these states from your email campaign",
		"States You Do NOT Want to Attend School In",
		"States you do NOT want",
		"States to avoid",
	],

	// Schools You Have Applied To → onboarding_form_data.schools_applied_to
	schoolsAppliedTo: ["Schools You Have Applied To", "Schools applied to"],

	// Divisions You're Willing AND capable to Compete At → onboarding_form_data.divisions_willing
	divisionsWilling: [
		"Divisions You're Willing AND capable to Compete At (we will audit this with you on call)",
		"Divisions You're Willing AND capable to Compete At",
		"Divisions",
		"Divisions willing to compete",
	],

	// Colleges You Do NOT Want to Be Recruited By → onboarding_form_data.colleges_not_wanted
	collegesNotWanted: [
		"Colleges You Do NOT Want to Be Recruited By (think hard)",
		"Colleges You Do NOT Want to Be Recruited By",
		"Colleges NOT wanted",
		"Schools to avoid",
	],

	// Most Important Qualities You're Looking For → onboarding_form_data.most_important_qualities
	mostImportantQualities: [
		"Most Important Qualities You're Looking For in a School",
		"Most Important Qualities",
		"Important qualities in a school",
	],

	// Would you attend a Religious Affiliated school → onboarding_form_data.religious_affiliation
	religiousAffiliation: [
		"Would you attend a Religious Affiliated school: (yes/no/N/A)",
		"Would you attend a Religious Affiliated school",
		"Religious-affiliated school",
		"Religious preference",
	],

	// Interested in Competing at an HBCU? → onboarding_form_data.hbcu_interest
	hbcuInterest: [
		"Interested in Competing at an HBCU? (yes/no)",
		"Interested in Competing at an HBCU",
		"Interested in HBCU",
		"HBCU interest",
	],

	// Do U.S. News Rankings Affect Your Decision? → onboarding_form_data.us_news_preference
	usNewsPreference: [
		"Do U.S. News Rankings Affect Your Decision? (top 200, top 100, top 50?)",
		"Do U.S. News Rankings Affect Your Decision",
		"U.S. News preference",
		"School ranking preference",
	],

	// School Size Preference → onboarding_form_data.school_size_preference
	schoolSizePreference: [
		"School Size Preference",
		"School size preference",
		"School size",
	],

	// Do you want to go to a military academy? → onboarding_form_data.military_academy
	militaryAcademy: [
		"Do you want to go to a military academy?",
		"Military academy",
		"Military academy interest",
	],

	// Annual College Tuition Budget → onboarding_form_data.tuition_budget
	tuitionBudget: [
		"Annual College Tuition Budget (if discussed with family)",
		"Annual College Tuition Budget",
		"Annual tuition budget",
		"Tuition budget",
	],

	// ========================================================================
	// SECTION: Athletic Background
	// ========================================================================

	// Most Impressive Career Achievement → onboarding_form_data.career_achievement
	careerAchievement: [
		"Most Impressive Career Achievement: (e.g., State Finalist, Junior Olympics, Nationals)",
		"Most Impressive Career Achievement",
		"Career achievement",
	],

	// ========================================================================
	// SECTION: Work Ethic & Character
	// ========================================================================

	// What College Coaches Should Know → onboarding_form_data.work_ethic_blurb
	workEthicBlurb: [
		"What College Coaches Should Know About Your Personality or Mindset",
		"What College Coaches Should Know",
		"Work ethic",
		"Character blurb",
	],

	// ========================================================================
	// SECTION: Personal Story / Differentiator
	// ========================================================================

	// Challenges You've Overcome → onboarding_form_data.challenges_overcome
	challengesOvercome: [
		"Challenges You've Overcome in Your Journey (do not include injuries)",
		"Challenges You've Overcome",
		"Challenges",
	],

	// What Makes Your Story Different → onboarding_form_data.personal_story
	personalStory: [
		"What Makes Your Story Different From Other Athletes (this is your WHY for a coach to recruit you)",
		"What Makes Your Story Different",
		"Personal story",
		"Differentiator",
	],

	// Your Ultimate Goal → onboarding_form_data.ultimate_goal
	ultimateGoal: [
		"Your Ultimate Goal in the College recruitment process",
		"Your Ultimate Goal",
		"Ultimate goal",
		"Goals",
	],

	// Type of Team Environment You Thrive In → onboarding_form_data.team_environment
	teamEnvironment: [
		"Type of Team Environment You Thrive In",
		"Team environment preference",
		"Team environment",
	],

	// Type of Coaching You Respond to Best → onboarding_form_data.coaching_style_preference
	coachingStylePreference: [
		"Type of Coaching You Respond to Best",
		"Coaching style preference",
		"Coaching style",
	],

	// ANYTHING ELSE WE NEED TO KNOW → onboarding_form_data.additional_info
	additionalInfo: [
		"ANYTHING ELSE WE NEED TO KNOW ABOUT YOU",
		"Additional information",
		"Standout information",
	],

	// ========================================================================
	// SECTION: Requirements for Poster (if separate form)
	// ========================================================================

	// Upload Images of yourself → poster images
	posterPrimary: [
		"Upload Images of yourself that YOU want on the poster",
		"Primary Image",
		"poster_primary",
		"primary_poster",
		"Main Photo",
	],
	posterImage2: [
		"2nd image (Optional)",
		"2nd Image",
		"poster_2",
		"secondary_poster",
		"Second Photo",
	],
	posterImage3: [
		"3rd Image (Optional)",
		"3rd Image",
		"poster_3",
		"tertiary_poster",
		"Third Photo",
	],

	// Events & Times for poster → onboarding_form_data.poster_events_times
	posterEventsTimes: ["Events & Times you want included", "Events & Times"],

	// Additional standout info for poster → onboarding_form_data.poster_standout_info
	posterStandoutInfo: [
		"Please add any additional information about yourself that makes you stand out",
		"Standout info",
	],

	// What are you looking for in a school? (poster form) → onboarding_form_data.poster_school_preferences
	posterSchoolPreferences: [
		"What are you looking for in a school? (BE SPECIFIC)",
		"School preferences for poster",
	],

	// Additional videos → onboarding_form_data.additional_videos
	additionalVideos: [
		"(Optional) Upload ANY ADDITIONAL videos",
		"Additional videos",
	],

	// ========================================================================
	// HIDDEN/SYSTEM FIELDS
	// ========================================================================

	// Hidden field for updates
	submissionId: ["submission_id", "tally_submission_id"],

	// Poster need check (for conditional redirect)
	needsPoster: [
		"Do you need poster",
		"Need poster",
		"Poster needed",
		"needs_poster",
	],

	// Contact fields (may be auto-filled or separate)
	email: ["Email", "email", "contact_email"],
	phone: ["Phone", "phone_number", "phone"],
} as const;

/**
 * Finds the first matching field using multiple possible labels
 */
export function findField(
	fields: TallyField[],
	possibleLabels: readonly string[],
): TallyField | undefined {
	for (const label of possibleLabels) {
		const field = fields.find(
			(f) =>
				f.key.toLowerCase() === label.toLowerCase() ||
				f.label.toLowerCase() === label.toLowerCase(),
		);
		if (field) {
			return field;
		}
	}
	return undefined;
}

/**
 * Gets a string value using multiple possible labels
 */
export function findStringValue(
	fields: TallyField[],
	possibleLabels: readonly string[],
): string | null {
	const field = findField(fields, possibleLabels);
	if (!field) return null;

	if (typeof field.value === "string") {
		return field.value.trim() || null;
	}
	if (typeof field.value === "number") {
		return String(field.value);
	}
	return null;
}

/**
 * Gets a number value using multiple possible labels
 */
export function findNumberValue(
	fields: TallyField[],
	possibleLabels: readonly string[],
): number | null {
	const field = findField(fields, possibleLabels);
	if (!field) return null;

	if (typeof field.value === "number") {
		return field.value;
	}
	if (typeof field.value === "string") {
		const parsed = Number.parseFloat(field.value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
}

/**
 * Gets an integer value using multiple possible labels
 */
export function findIntegerValue(
	fields: TallyField[],
	possibleLabels: readonly string[],
): number | null {
	const num = findNumberValue(fields, possibleLabels);
	return num !== null ? Math.round(num) : null;
}

/**
 * Gets file uploads using multiple possible labels
 */
export function findFileValue(
	fields: TallyField[],
	possibleLabels: readonly string[],
): TallyFileUpload[] {
	const field = findField(fields, possibleLabels);
	if (!field) return [];

	if (Array.isArray(field.value)) {
		return field.value.filter(
			(v): v is TallyFileUpload =>
				typeof v === "object" && v !== null && "url" in v && "mimeType" in v,
		);
	}
	return [];
}
