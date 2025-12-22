import XLSX, { type WorkSheet } from "xlsx";

/**
 * Find the header row by looking for "Conference" in any cell
 * Scans first 10 rows to find the header
 */
function findHeaderRow(sheet: WorkSheet): number {
	const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
	const maxRow = Math.min(range.e.r, 10); // Check first 10 rows

	for (let row = 0; row <= maxRow; row++) {
		for (let col = range.s.c; col <= range.e.c; col++) {
			const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
			const cell = sheet[cellAddress];
			if (cell && String(cell.v).toLowerCase() === "conference") {
				return row;
			}
		}
	}

	// Fallback to row 6 (0-indexed = 5) for legacy Excel format
	return 5;
}

export interface CoachRow {
	// Division identification
	_division: string; // DI, DII, DIII, JuCo, NAIA
	_sheetName: string;

	// Coach identification
	"Unique ID": string;
	"First name": string;
	"Last name": string;
	"Email address": string | null;
	"Phone number": string | null;
	Position: string;

	// University information
	School: string;
	State: string;
	City: string;
	Division: string;
	Conference: string;
	Region: string | null;
	"Size of city": string | null;
	"Private/Public": string | null;
	"Religious affiliation?": string | null;
	"HBCU? Community College? Women only?": string | null;

	// Academic metrics
	"Average GPA": string | null;
	"SAT-Reading (25th-75th percentile)": string | null;
	"SAT-Math (25th-75th percentile)": string | null;
	"ACT composite (25th-75th percentile)": string | null;
	"Acceptance rate": string | null;
	"Total yearly cost (in-state/out-of-state)": string | null;
	"Majors offered": string | null;
	"No. of undergrads": string | null;
	"U.S. News ranking (National, 2018)": string | null;
	"U.S. News ranking (national liberal arts, 2018)": string | null;
	"IPEDS/NCES ID": string | null;

	// Team/Program information
	"Landing pages": string | null;
	"Team's Twitter": string | null;
	"Team's Instagram": string | null;
	Questionnaire: string | null;
	"Sport code": string; // "Men's Track"

	// Coach social media
	"Individual's Twitter": string | null;
	"Individual's Instagram": string | null;

	// Import tracking
	"Added? x=new person | j=job change | e=email change | #=# change": string | null;
	"Removed? (y)": string | null;
	"Hire date": string | null;
	Responsibilities: string | null;

	[key: string]: any; // Allow additional unknown columns
}

export async function parseExcelFile(
	fileUrl: string,
): Promise<Record<string, CoachRow[]>> {
	console.log(`[Excel Parser] Downloading file from: ${fileUrl}`);

	// Download file from Supabase signed URL
	const response = await fetch(fileUrl);
	if (!response.ok) {
		throw new Error(`Failed to download file: ${response.statusText}`);
	}

	const buffer = await response.arrayBuffer();
	console.log(`[Excel Parser] Downloaded ${buffer.byteLength} bytes`);

	// Parse Excel workbook
	const workbook = XLSX.read(buffer, { type: "array" });
	console.log(`[Excel Parser] Found sheets: ${workbook.SheetNames.join(", ")}`);

	const sheets: Record<string, CoachRow[]> = {};

	for (const sheetName of workbook.SheetNames) {
		// Skip tutorial or non-data sheets
		if (
			sheetName.toLowerCase().includes("tutorial") ||
			sheetName.toLowerCase().includes("readme")
		) {
			console.log(`[Excel Parser] Skipping sheet: ${sheetName}`);
			continue;
		}

		const sheet = workbook.Sheets[sheetName];

		// Find header row by looking for "Conference" column
		const headerRow = findHeaderRow(sheet);
		console.log(`[Excel Parser] Sheet "${sheetName}": Header row found at ${headerRow + 1}`);

		const data = XLSX.utils.sheet_to_json<CoachRow>(sheet, {
			range: headerRow,
			defval: null,
			raw: false, // Convert all values to strings
		});

		// Add metadata to each row
		for (const row of data) {
			row._division = sheetName;
			row._sheetName = sheetName;
		}

		console.log(`[Excel Parser] Sheet "${sheetName}": ${data.length} rows`);
		sheets[sheetName] = data;
	}

	return sheets;
}

export function filterInvalidRows(sheets: Record<string, CoachRow[]>): CoachRow[] {
	const allRows: CoachRow[] = [];

	for (const [sheetName, rows] of Object.entries(sheets)) {
		// Debug: Log first row's keys to see actual column names
		if (rows.length > 0) {
			const sampleKeys = Object.keys(rows[0]).slice(0, 10);
			console.log(`[Excel Parser] Sample columns in "${sheetName}":`, sampleKeys);
		}

		const validRows = rows.filter((row) => {
			// Filter out rows marked as removed
			if (row["Removed? (y)"] === "y" || row["Removed? (y)"] === "Y") {
				return false;
			}

			// Filter out rows without email AND without position (completely empty coach records)
			if (
				!row["Email address"] &&
				!row.Position &&
				!row["First name"] &&
				!row["Last name"]
			) {
				return false;
			}

			// Must have a school name
			if (!row.School) {
				return false;
			}

			return true;
		});

		console.log(
			`[Excel Parser] Sheet "${sheetName}": ${validRows.length}/${rows.length} valid rows`,
		);
		allRows.push(...validRows);
	}

	return allRows;
}

export function deduplicateByUniqueId(rows: CoachRow[]): CoachRow[] {
	// Group rows by Unique ID
	const grouped = new Map<string, CoachRow[]>();

	for (const row of rows) {
		const uniqueId = row["Unique ID"];
		if (!uniqueId) continue; // Skip rows without Unique ID

		if (!grouped.has(uniqueId)) {
			grouped.set(uniqueId, []);
		}
		grouped.get(uniqueId)!.push(row);
	}

	// For each group, take the last row (most recent change)
	const deduped: CoachRow[] = [];
	for (const [uniqueId, groupRows] of grouped.entries()) {
		if (groupRows.length > 1) {
			console.log(
				`[Excel Parser] Deduplicating ${uniqueId}: ${groupRows.length} occurrences, taking latest`,
			);
		}
		deduped.push(groupRows[groupRows.length - 1]); // Take last occurrence
	}

	console.log(
		`[Excel Parser] Deduplicated: ${rows.length} → ${deduped.length} rows`,
	);
	return deduped;
}
