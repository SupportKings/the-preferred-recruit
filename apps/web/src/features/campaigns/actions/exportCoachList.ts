"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/serviceRole";

import { getUser } from "@/queries/getUser";

import { z } from "zod";
import type {
	CampaignCoachData,
	CoachExportServerFilters,
} from "../types/coach-export-types";
import { getCampaignCoachesAction } from "./getCampaignCoaches";

const exportCoachListSchema = z.object({
	campaignId: z.string().uuid(),
	coachIds: z.array(z.string().uuid()).optional(),
	filters: z
		.object({
			divisions: z.array(z.string()).optional(),
			universities: z.array(z.string().uuid()).optional(),
			programs: z.array(z.string().uuid()).optional(),
			minTuition: z.number().optional(),
			maxTuition: z.number().optional(),
		})
		.optional(),
});

// Convert simple filter format to server format with default operators
function convertSimpleFiltersToServerFormat(
	filters:
		| {
				divisions?: string[];
				universities?: string[];
				programs?: string[];
				minTuition?: number;
				maxTuition?: number;
		  }
		| undefined,
): CoachExportServerFilters | undefined {
	if (!filters) return undefined;

	const serverFilters: CoachExportServerFilters = {};

	if (filters.divisions && filters.divisions.length > 0) {
		serverFilters.divisions = {
			values: filters.divisions,
			operator: filters.divisions.length > 1 ? "is any of" : "is",
		};
	}

	if (filters.universities && filters.universities.length > 0) {
		serverFilters.universities = {
			values: filters.universities,
			operator: filters.universities.length > 1 ? "is any of" : "is",
		};
	}

	if (filters.programs && filters.programs.length > 0) {
		serverFilters.programs = {
			values: filters.programs,
			operator: filters.programs.length > 1 ? "is any of" : "is",
		};
	}

	if (filters.minTuition !== undefined || filters.maxTuition !== undefined) {
		const values: number[] = [];
		if (filters.minTuition !== undefined) values.push(filters.minTuition);
		if (filters.maxTuition !== undefined) values.push(filters.maxTuition);

		serverFilters.tuition = {
			values,
			operator:
				filters.minTuition !== undefined && filters.maxTuition !== undefined
					? "is between"
					: filters.minTuition !== undefined
						? "is greater than or equal to"
						: "is less than or equal to",
		};
	}

	return Object.keys(serverFilters).length > 0 ? serverFilters : undefined;
}

export const exportCoachListAction = actionClient
	.schema(exportCoachListSchema)
	.action(async ({ parsedInput }) => {
		const { campaignId, coachIds, filters } = parsedInput;

		// Get current user
		const session = await getUser();
		if (!session?.user) {
			throw new Error("You must be logged in to export");
		}

		const supabase = await createClient();

		// Get team member ID for the current user
		const { data: teamMember } = await supabase
			.from("team_members")
			.select("id")
			.eq("user_id", session.user.id)
			.eq("is_deleted", false)
			.maybeSingle();

		if (!teamMember) {
			throw new Error("Team member not found");
		}

		// Fetch coaches with filters and/or specific coach IDs
		// Use a large page size to get all coaches for export
		const coachesResult = await getCampaignCoachesAction(campaignId, {
			page: 1,
			pageSize: 10000, // Large number to get all for export
			filters: convertSimpleFiltersToServerFormat(filters),
			coachIds,
		});

		if (!coachesResult.success || !coachesResult.data) {
			throw new Error(coachesResult.error || "Failed to fetch coaches");
		}

		const coaches = coachesResult.data;

		// Generate CSV content
		const csv = generateCSV(coaches);

		// Generate filename
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const fileName = `coach-export-${timestamp}.csv`;

		// Upload CSV to Supabase storage
		const serviceClient = await createServiceClient();
		const storagePath = `${campaignId}/${fileName}`;

		const csvBlob = new Blob([csv], { type: "text/csv" });

		const { error: uploadError } = await serviceClient.storage
			.from("coach-exports")
			.upload(storagePath, csvBlob, {
				cacheControl: "3600",
				upsert: false,
				contentType: "text/csv",
			});

		if (uploadError) {
			console.error("Upload error:", uploadError);
			throw new Error(`Failed to upload file: ${uploadError.message}`);
		}

		// Get signed URL for the file (valid for 7 days)
		const { data: urlData, error: urlError } = await serviceClient.storage
			.from("coach-exports")
			.createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

		if (urlError || !urlData?.signedUrl) {
			console.error("URL generation error:", urlError);
			throw new Error("Failed to generate file URL");
		}

		const fileUrl = urlData.signedUrl;

		// Create sending_tool_lead_list record
		const { error: listError } = await supabase
			.from("sending_tool_lead_lists")
			.insert({
				campaign_id: campaignId,
				format: "csv",
				row_count: coaches.length,
				file_url: fileUrl,
				internal_notes: `Exported ${coaches.length} coaches`,
				generated_by: teamMember.id,
				generated_at: new Date().toISOString(),
			});

		if (listError) {
			console.error("Error creating sending tool lead list:", listError);
			// Don't throw - file is still uploaded and can be downloaded
		}

		// Revalidate campaign page
		revalidatePath(`/dashboard/campaigns/${campaignId}`);

		return {
			success: true,
			data: {
				fileName,
				csvContent: csv, // Return CSV for immediate download
				rowCount: coaches.length,
				fileUrl,
			},
		};
	});

function generateCSV(coaches: CampaignCoachData[]): string {
	// Define CSV headers matching the import format (Men's Track and Field Database)
	const headers = [
		"First name",
		"Last name",
		"Email address",
		"Phone number",
		"Position",
		"School",
		"State",
		"City",
		"Division",
		"Conference",
		"Region",
		"Size of city",
		"Private/Public",
		"Religious affiliation?",
		"Average GPA",
		"SAT-Reading (25th-75th percentile)",
		"SAT-Math (25th-75th percentile)",
		"ACT composite (25th-75th percentile)",
		"Acceptance rate",
		"Total yearly cost (in-state/out-of-state)",
		"No. of undergrads",
		"Individual's Twitter",
		"Individual's Instagram",
	];

	// Generate CSV rows matching import format
	const rows = coaches.map((coach) => {
		// Split full name into first and last
		const nameParts = (coach.coachName || "").trim().split(" ");
		const firstName = nameParts[0] || "";
		const lastName = nameParts.slice(1).join(" ") || "";

		// Map division name to code (DI, DII, DIII, etc.)
		const divisionCode = mapDivisionToCode(coach.division);

		// Format percentile ranges
		const satReading = formatPercentileRange(
			coach.satReading25th,
			coach.satReading75th,
		);
		const satMath = formatPercentileRange(coach.satMath25th, coach.satMath75th);
		const actComposite = formatPercentileRange(
			coach.actComposite25th,
			coach.actComposite75th,
		);

		// Format acceptance rate as percentage
		const acceptanceRate = coach.acceptanceRate
			? `${coach.acceptanceRate}%`
			: "";

		return [
			escapeCSV(firstName),
			escapeCSV(lastName),
			escapeCSV(coach.workEmail || coach.coachEmail || ""),
			escapeCSV(coach.workPhone || coach.coachPhone || ""),
			escapeCSV(coach.jobTitle || ""),
			escapeCSV(coach.universityName || ""),
			escapeCSV(coach.state || ""),
			escapeCSV(coach.city || ""),
			escapeCSV(divisionCode),
			escapeCSV(coach.conferenceName || ""),
			escapeCSV(coach.region || ""),
			escapeCSV(coach.sizeOfCity || ""),
			escapeCSV(coach.publicPrivate || ""),
			escapeCSV(coach.religiousAffiliation || ""),
			coach.averageGpa ? coach.averageGpa.toString() : "",
			escapeCSV(satReading),
			escapeCSV(satMath),
			escapeCSV(actComposite),
			escapeCSV(acceptanceRate),
			coach.tuition ? coach.tuition.toString() : "",
			coach.undergraduateEnrollment
				? coach.undergraduateEnrollment.toString()
				: "",
			escapeCSV(coach.coachTwitter || ""),
			escapeCSV(coach.coachInstagram || ""),
		];
	});

	// Combine headers and rows
	const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];

	return csvLines.join("\n");
}

function formatPercentileRange(min: number | null, max: number | null): string {
	if (min && max) {
		return `${min}-${max}`;
	}
	if (min) {
		return min.toString();
	}
	if (max) {
		return max.toString();
	}
	return "";
}

function mapDivisionToCode(division: string | null): string {
	if (!division) return "";
	const lower = division.toLowerCase();
	if (
		lower.includes("division i") &&
		!lower.includes("ii") &&
		!lower.includes("iii")
	) {
		return "DI";
	}
	if (lower.includes("division ii") && !lower.includes("iii")) {
		return "DII";
	}
	if (lower.includes("division iii")) {
		return "DIII";
	}
	if (lower.includes("naia")) {
		return "NAIA";
	}
	if (lower.includes("juco") || lower.includes("junior college")) {
		return "JuCo";
	}
	return division;
}

function escapeCSV(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
