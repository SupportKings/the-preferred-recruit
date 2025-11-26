import { type NextRequest, NextResponse } from "next/server";

import {
	findFileValue,
	findStringValue,
	type TallyFileUpload,
	type TallyWebhookPayload,
	verifyTallySignature,
} from "@/lib/tally-webhook";

import { createClient } from "@/utils/supabase/serviceRole";

// ============================================================================
// Constants
// ============================================================================

// Redirect to Calendly after poster form submission
const CALENDLY_URL =
	"https://calendly.com/coachmalik-thepreferredrecruit/onboarding";

// Field mappings for poster form
const POSTER_FIELD_MAPPINGS = {
	athleteId: ["athleteId", "athlete_id", "Athlete ID"],
	posterPrimary: [
		"Primary Image",
		"poster_primary",
		"primary_poster",
		"Main Photo",
	],
	posterImage2: ["2nd Image", "poster_2", "secondary_poster", "Second Photo"],
	posterImage3: ["3rd Image", "poster_3", "tertiary_poster", "Third Photo"],
} as const;

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
// Webhook Handler
// ============================================================================

export async function POST(request: NextRequest) {
	const startTime = Date.now();

	try {
		// Get the raw body for signature verification
		const rawBody = await request.text();

		// Verify webhook signature
		const signature = request.headers.get("Tally-Signature");
		const signingSecret = process.env.TALLY_WEBHOOK_SIGNING_SECRET;

		if (!signingSecret) {
			console.error(
				"Missing TALLY_WEBHOOK_SIGNING_SECRET environment variable",
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
		const payload: TallyWebhookPayload = JSON.parse(rawBody);

		console.log(
			`[Tally Poster Webhook] Received submission ${payload.data.submissionId} for form "${payload.data.formName}"`,
		);

		// Extract fields
		const { fields } = payload.data;

		// Get athlete ID from hidden field
		const athleteId = findStringValue(fields, POSTER_FIELD_MAPPINGS.athleteId);

		if (!athleteId) {
			console.error("Missing required field: athleteId");
			return NextResponse.json(
				{ error: "Missing required field: athleteId" },
				{ status: 400 },
			);
		}

		// Initialize Supabase client
		const supabase = await createClient();

		// Verify athlete exists
		const { data: athlete, error: athleteError } = await supabase
			.from("athletes")
			.select("id, full_name")
			.eq("id", athleteId)
			.single();

		if (athleteError || !athlete) {
			console.error(`Athlete not found: ${athleteId}`);
			return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
		}

		console.log(
			`[Tally Poster Webhook] Processing poster images for athlete ${athlete.full_name} (${athleteId})`,
		);

		// Handle poster image uploads
		const posterUrls: {
			poster_primary_url?: string;
			poster_image_2_url?: string;
			poster_image_3_url?: string;
		} = {};

		const primaryImages = findFileValue(
			fields,
			POSTER_FIELD_MAPPINGS.posterPrimary,
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
			POSTER_FIELD_MAPPINGS.posterImage2,
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
			POSTER_FIELD_MAPPINGS.posterImage3,
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

		// Update athlete with poster URLs
		if (Object.keys(posterUrls).length > 0) {
			const { error: updateError } = await supabase
				.from("athletes")
				.update({
					...posterUrls,
					updated_at: new Date().toISOString(),
				})
				.eq("id", athleteId);

			if (updateError) {
				console.error("Error updating poster URLs:", updateError);
				return NextResponse.json(
					{ error: "Failed to update poster URLs" },
					{ status: 500 },
				);
			}

			console.log(
				`[Tally Poster Webhook] Updated ${Object.keys(posterUrls).length} poster URLs for athlete ${athleteId}`,
			);
		} else {
			console.log(
				"[Tally Poster Webhook] No poster images found in submission",
			);
		}

		const duration = Date.now() - startTime;
		console.log(
			`[Tally Poster Webhook] Completed processing in ${duration}ms for athlete ${athleteId}`,
		);

		// Return success with redirect to Calendly
		return NextResponse.json({
			success: true,
			athleteId,
			athleteName: athlete.full_name,
			postersUploaded: Object.keys(posterUrls).length,
			duration: `${duration}ms`,
			redirectUrl: CALENDLY_URL,
		});
	} catch (error) {
		console.error("[Tally Poster Webhook] Error:", error);
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
		name: "Tally Poster Webhook",
		description:
			"Receives poster image uploads from Tally and stores them in Supabase Storage",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Tally-Signature": "HMAC-SHA256 signature of the payload",
		},
		requiredFields: {
			athleteId:
				"Hidden field with athlete UUID (from onboarding form redirect)",
		},
		optionalFields: {
			"Primary Image": "Main poster photo",
			"2nd Image": "Secondary poster photo",
			"3rd Image": "Tertiary poster photo",
		},
		actions: [
			"Verifies webhook signature",
			"Validates athlete exists",
			"Downloads images from Tally CDN",
			"Uploads images to Supabase Storage (athlete-assets bucket)",
			"Updates athlete record with poster URLs",
		],
		redirectUrl: CALENDLY_URL,
	});
}
