/**
 * Utility functions for data transformation
 */

/**
 * Convert "-" or empty values to null
 */
export function nullifyEmptyString(value: string | null | undefined): string | null {
	if (!value || value === "-" || value.trim() === "") {
		return null;
	}
	return value;
}

/**
 * Safely merge update object by removing null/undefined values
 * This prevents overriding existing data with null values
 */
export function removeNullValues<T extends Record<string, any>>(obj: T): Partial<T> {
	const cleaned: Partial<T> = {};

	for (const [key, value] of Object.entries(obj)) {
		// Only include non-null and non-undefined values
		if (value !== null && value !== undefined) {
			cleaned[key as keyof T] = value;
		}
	}

	return cleaned;
}

/**
 * Parse percentile range like "600-700" into min/max values
 */
export function parsePercentileRange(
	value: string | null,
): { min: number | null; max: number | null } {
	if (!value || value === "-") {
		return { min: null, max: null };
	}

	const parts = value.split("-").map((p) => p.trim());
	if (parts.length !== 2) {
		return { min: null, max: null };
	}

	const min = Number.parseInt(parts[0], 10);
	const max = Number.parseInt(parts[1], 10);

	return {
		min: Number.isNaN(min) ? null : min,
		max: Number.isNaN(max) ? null : max,
	};
}

/**
 * Parse percentage string like "45%" to decimal 0.45
 */
export function parsePercentage(value: string | null): number | null {
	if (!value || value === "-") return null;

	const cleaned = value.replace("%", "").trim();
	const num = Number.parseFloat(cleaned);

	if (Number.isNaN(num)) return null;

	// If already in decimal form (0-1), return as-is
	if (num <= 1) return num;

	// Otherwise convert percentage to decimal
	return num / 100;
}

/**
 * Parse integer from string, return null if invalid
 * Handles various currency formats:
 * - US format: $32,564 or 32,564
 * - European format: US$71.282 or 71.282 (period as thousands separator)
 */
export function parseInteger(value: string | null): number | null {
	if (!value || value === "-") return null;

	// Remove currency symbols and prefixes (US$, $, €, £, etc.)
	let cleaned = value.replace(/^(US\$|\$|€|£)/i, "").trim();

	// Handle European format where period is thousands separator
	// e.g., "71.282" = 71,282 (not 71.282 decimal)
	if (cleaned.includes(".") && !cleaned.includes(",")) {
		const parts = cleaned.split(".");
		const lastPart = parts[parts.length - 1];

		// If last segment after period is 3 digits, treat as thousands separator
		if (lastPart.length === 3 && parts.length <= 3) {
			cleaned = cleaned.replace(/\./g, "");
		}
	}

	// Remove commas (thousands separators in US format)
	cleaned = cleaned.replace(/,/g, "");

	const num = Number.parseInt(cleaned, 10);

	return Number.isNaN(num) ? null : num;
}

/**
 * Parse float from string, return null if invalid
 */
export function parseFloat(value: string | null): number | null {
	if (!value || value === "-") return null;

	const cleaned = value.replace(/,/g, "").trim();
	const num = Number.parseFloat(cleaned);

	return Number.isNaN(num) ? null : num;
}

/**
 * Map division sheet name to division name
 */
export function mapDivisionCode(sheetName: string): string {
	const mapping: Record<string, string> = {
		DI: "DI",
		DII: "DII",
		DIII: "DIII",
		JuCo: "JuCo",
		NAIA: "NAIA",
	};

	return mapping[sheetName] || sheetName;
}

/**
 * Derive event group from responsibility text
 * Returns array of event groups found in the text (lowercase to match DB enum)
 */
export function parseEventGroups(
	responsibilities: string | null,
): Array<"sprints" | "distance" | "throws" | "jumps" | "hurdles" | "relays" | "combined"> {
	if (!responsibilities) return [];

	const text = responsibilities.toLowerCase();
	const groups: Set<string> = new Set();

	if (text.includes("sprint") || text.includes("100") || text.includes("200") || text.includes("400")) {
		groups.add("sprints");
	}
	if (text.includes("distance") || text.includes("800") || text.includes("1500") || text.includes("mile") || text.includes("3000") || text.includes("5000") || text.includes("10000") || text.includes("xc") || text.includes("cross country")) {
		groups.add("distance");
	}
	if (text.includes("throw") || text.includes("shot") || text.includes("discus") || text.includes("javelin") || text.includes("hammer")) {
		groups.add("throws");
	}
	if (text.includes("jump") || text.includes("long jump") || text.includes("triple") || text.includes("high jump") || text.includes("pole vault")) {
		groups.add("jumps");
	}
	if (text.includes("hurdle") || text.includes("110h") || text.includes("400h") || text.includes("100h")) {
		groups.add("hurdles");
	}
	if (text.includes("relay") || text.includes("4x1") || text.includes("4x4")) {
		groups.add("relays");
	}
	if (text.includes("multi") || text.includes("heptathlon") || text.includes("decathlon") || text.includes("pentathlon") || text.includes("combined") || text.includes("all events")) {
		groups.add("combined");
	}

	return Array.from(groups) as Array<"sprints" | "distance" | "throws" | "jumps" | "hurdles" | "relays" | "combined">;
}

/**
 * Derive primary specialty from responsibilities text
 * Returns the first/main event group
 */
export function derivePrimarySpecialty(
	responsibilities: string | null,
): "sprints" | "distance" | "throws" | "jumps" | "hurdles" | "relays" | "combined" | null {
	const groups = parseEventGroups(responsibilities);
	return groups.length > 0 ? groups[0] : null;
}

/**
 * Parse specific event names from responsibilities text
 * Returns array of event names like "100m", "Shot Put", "Pole Vault"
 */
export function parseSpecificEvents(responsibilities: string | null): string[] {
	if (!responsibilities) return [];

	const text = responsibilities.toLowerCase();
	const events: string[] = [];

	// Sprint events
	if (text.includes("100m") || text.includes("100 m")) events.push("100m");
	if (text.includes("200m") || text.includes("200 m")) events.push("200m");
	if (text.includes("400m") || text.includes("400 m")) events.push("400m");

	// Distance events
	if (text.includes("800m") || text.includes("800 m")) events.push("800m");
	if (text.includes("1500m") || text.includes("1500 m") || text.includes("mile")) events.push("1500m");
	if (text.includes("3000m") || text.includes("3000 m") || text.includes("steeplechase")) events.push("3000m Steeplechase");
	if (text.includes("5000m") || text.includes("5000 m") || text.includes("5k")) events.push("5000m");
	if (text.includes("10000m") || text.includes("10000 m") || text.includes("10k")) events.push("10000m");

	// Hurdles
	if (text.includes("110h") || text.includes("110m hurdles")) events.push("110m Hurdles");
	if (text.includes("100h") || text.includes("100m hurdles")) events.push("100m Hurdles");
	if (text.includes("400h") || text.includes("400m hurdles")) events.push("400m Hurdles");

	// Jumps
	if (text.includes("long jump")) events.push("Long Jump");
	if (text.includes("triple jump")) events.push("Triple Jump");
	if (text.includes("high jump")) events.push("High Jump");
	if (text.includes("pole vault")) events.push("Pole Vault");

	// Throws
	if (text.includes("shot put") || text.includes("shot")) events.push("Shot Put");
	if (text.includes("discus")) events.push("Discus");
	if (text.includes("javelin")) events.push("Javelin");
	if (text.includes("hammer")) events.push("Hammer Throw");

	// Multis
	if (text.includes("decathlon")) events.push("Decathlon");
	if (text.includes("heptathlon")) events.push("Heptathlon");
	if (text.includes("pentathlon")) events.push("Pentathlon");

	// Relays
	if (text.includes("4x100") || text.includes("4x1")) events.push("4x100m Relay");
	if (text.includes("4x400") || text.includes("4x4")) events.push("4x400m Relay");

	return events;
}
