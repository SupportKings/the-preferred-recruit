import { type NextRequest, NextResponse } from "next/server";

import {
	type TallyFileUpload,
	type TallyWebhookPayload,
	verifyTallySignature,
} from "@/lib/tally-webhook";

import { createClient } from "@/utils/supabase/serviceRole";

// ============================================================================
// Constants
// ============================================================================

const CALENDLY_URL =
	"https://calendly.com/coachmalik-thepreferredrecruit/onboarding";

// Field mappings for poster form (based on actual Tally payload)
const POSTER_FIELD_MAPPINGS = {
	athleteId: ["athleteId"],
	eventsAndTimes: [
		"Events & Times you want included",
		"Events &amp; Times you want included",
	],
	standoutInfo: [
		"Please add any additional information about yourself that makes you stand out",
	],
	posterPrimary: ["Upload Images of yourself that YOU want on the poster"],
	posterImage2: ["2nd image (Optional)"],
	posterImage3: ["3rd Image (Optional)"],
	video1: [
		"(Optional) Upload ANY ADDITIONAL videos of your competitions, practice sessions, or impressive lifts (we typically have these in your google drive so do not worry about this one)",
	],
	// video2 has null label, will match by field type and position
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
	bucket: string,
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
		const extension = file.name.split(".").pop() || "bin";
		const fileName = `${athleteId}/${prefix}-${Date.now()}.${extension}`;

		// Upload to Supabase Storage
		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(fileName, downloaded.buffer, {
				contentType: file.mimeType || downloaded.contentType,
				cacheControl: "3600",
				upsert: true,
			});

		if (uploadError) {
			console.error(`Supabase upload error to ${bucket}:`, uploadError);
			return null;
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from(bucket).getPublicUrl(fileName);

		return publicUrl;
	} catch (error) {
		console.error("Error uploading to Supabase:", error);
		return null;
	}
}

/**
 * Finds a string value from fields by matching labels
 */
function findStringValue(
	fields: TallyWebhookPayload["data"]["fields"],
	labels: readonly string[],
): string | null {
	for (const label of labels) {
		const field = fields.find(
			(f) =>
				f.label?.toLowerCase() === label.toLowerCase() ||
				f.key?.toLowerCase() === label.toLowerCase(),
		);
		if (field && typeof field.value === "string") {
			return field.value.trim() || null;
		}
	}
	return null;
}

/**
 * Finds file uploads from fields by matching labels
 */
function findFileValue(
	fields: TallyWebhookPayload["data"]["fields"],
	labels: readonly string[],
): TallyFileUpload[] {
	for (const label of labels) {
		const field = fields.find(
			(f) =>
				f.label?.toLowerCase() === label.toLowerCase() ||
				f.key?.toLowerCase() === label.toLowerCase(),
		);
		if (field && Array.isArray(field.value)) {
			return field.value.filter(
				(v): v is TallyFileUpload =>
					typeof v === "object" && v !== null && "url" in v && "mimeType" in v,
			);
		}
	}
	return [];
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
		const signingSecret = process.env.TALLY_POSTER_WEBHOOK_SIGNING_SECRET;

		if (!signingSecret) {
			console.error(
				"[Tally Poster Form] Missing TALLY_POSTER_WEBHOOK_SIGNING_SECRET environment variable",
			);
			return NextResponse.json(
				{ error: "Webhook not configured" },
				{ status: 500 },
			);
		}

		if (!signature) {
			console.error("[Tally Poster Form] Missing Tally-Signature header");
			return NextResponse.json({ error: "Missing signature" }, { status: 401 });
		}

		if (!verifyTallySignature(rawBody, signature, signingSecret)) {
			console.error("[Tally Poster Form] Invalid Tally signature");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// Parse the payload
		const payload: TallyWebhookPayload = JSON.parse(rawBody);
		const { fields } = payload.data;

		console.log("=".repeat(80));
		console.log("[Tally Poster Form] WEBHOOK RECEIVED");
		console.log("=".repeat(80));
		console.log(
			`[Tally Poster Form] Form: "${payload.data.formName}" (ID: ${payload.data.formId})`,
		);
		console.log(
			`[Tally Poster Form] Submission ID: ${payload.data.submissionId}`,
		);
		console.log("-".repeat(80));

		// Extract athleteId from hidden field
		const athleteId = findStringValue(fields, POSTER_FIELD_MAPPINGS.athleteId);

		if (!athleteId) {
			console.error("[Tally Poster Form] Missing required field: athleteId");
			return NextResponse.json(
				{ error: "Missing required field: athleteId" },
				{ status: 400 },
			);
		}

		console.log(`[Tally Poster Form] Athlete ID: ${athleteId}`);

		// Initialize Supabase client
		const supabase = await createClient();

		// Verify athlete exists
		const { data: athlete, error: athleteError } = await supabase
			.from("athletes")
			.select("id, full_name")
			.eq("id", athleteId)
			.single();

		if (athleteError || !athlete) {
			console.error(`[Tally Poster Form] Athlete not found: ${athleteId}`);
			return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
		}

		console.log(
			`[Tally Poster Form] Processing for athlete: ${athlete.full_name}`,
		);

		// Extract text fields
		const eventsAndTimes = findStringValue(
			fields,
			POSTER_FIELD_MAPPINGS.eventsAndTimes,
		);
		const standoutInfo = findStringValue(
			fields,
			POSTER_FIELD_MAPPINGS.standoutInfo,
		);

		console.log(
			`[Tally Poster Form] Events & Times: ${eventsAndTimes || "N/A"}`,
		);
		console.log(`[Tally Poster Form] Standout Info: ${standoutInfo || "N/A"}`);

		// ========================================================================
		// Upload Images to athlete-assets bucket
		// ========================================================================
		const posterUrls: {
			poster_primary_url?: string;
			poster_image_2_url?: string;
			poster_image_3_url?: string;
		} = {};

		// Primary image
		const primaryImages = findFileValue(
			fields,
			POSTER_FIELD_MAPPINGS.posterPrimary,
		);
		if (primaryImages.length > 0) {
			console.log("[Tally Poster Form] Uploading primary image...");
			const url = await uploadToSupabase(
				supabase,
				"athlete-assets",
				athleteId,
				primaryImages[0],
				"poster-primary",
			);
			if (url) posterUrls.poster_primary_url = url;
		}

		// 2nd image
		const secondaryImages = findFileValue(
			fields,
			POSTER_FIELD_MAPPINGS.posterImage2,
		);
		if (secondaryImages.length > 0) {
			console.log("[Tally Poster Form] Uploading 2nd image...");
			const url = await uploadToSupabase(
				supabase,
				"athlete-assets",
				athleteId,
				secondaryImages[0],
				"poster-2",
			);
			if (url) posterUrls.poster_image_2_url = url;
		}

		// 3rd image
		const tertiaryImages = findFileValue(
			fields,
			POSTER_FIELD_MAPPINGS.posterImage3,
		);
		if (tertiaryImages.length > 0) {
			console.log("[Tally Poster Form] Uploading 3rd image...");
			const url = await uploadToSupabase(
				supabase,
				"athlete-assets",
				athleteId,
				tertiaryImages[0],
				"poster-3",
			);
			if (url) posterUrls.poster_image_3_url = url;
		}

		console.log(
			`[Tally Poster Form] Uploaded ${Object.keys(posterUrls).length} image(s)`,
		);

		// ========================================================================
		// Upload Videos to athlete-videos bucket
		// ========================================================================
		const videoUrls: string[] = [];

		// Video 1 (has label)
		const video1Files = findFileValue(fields, POSTER_FIELD_MAPPINGS.video1);
		if (video1Files.length > 0) {
			console.log("[Tally Poster Form] Uploading video 1...");
			const url = await uploadToSupabase(
				supabase,
				"athlete-videos",
				athleteId,
				video1Files[0],
				"poster-video-1",
			);
			if (url) videoUrls.push(url);
		}

		// Video 2 (has null label - find by type and position)
		// It's the last FILE_UPLOAD field with null label
		const video2Field = fields.find(
			(f) =>
				f.type === "FILE_UPLOAD" &&
				f.label === null &&
				Array.isArray(f.value) &&
				f.value.length > 0,
		);
		if (video2Field && Array.isArray(video2Field.value)) {
			const video2Files = video2Field.value.filter(
				(v): v is TallyFileUpload =>
					typeof v === "object" && v !== null && "url" in v && "mimeType" in v,
			);
			if (video2Files.length > 0) {
				console.log("[Tally Poster Form] Uploading video 2...");
				const url = await uploadToSupabase(
					supabase,
					"athlete-videos",
					athleteId,
					video2Files[0],
					"poster-video-2",
				);
				if (url) videoUrls.push(url);
			}
		}

		console.log(`[Tally Poster Form] Uploaded ${videoUrls.length} video(s)`);

		// ========================================================================
		// Build poster_form_data JSONB
		// ========================================================================
		const posterFormData = {
			submission_id: payload.data.submissionId,
			submitted_at: payload.data.createdAt,
			events_and_times: eventsAndTimes,
			standout_info: standoutInfo,
			video_urls: videoUrls.length > 0 ? videoUrls : null,
		};

		// ========================================================================
		// Update athlete record
		// ========================================================================
		const updateData: Record<string, unknown> = {
			...posterUrls,
			poster_form_data: posterFormData,
			updated_at: new Date().toISOString(),
		};

		const { error: updateError } = await supabase
			.from("athletes")
			.update(updateData)
			.eq("id", athleteId);

		if (updateError) {
			console.error("[Tally Poster Form] Error updating athlete:", updateError);
			return NextResponse.json(
				{ error: "Failed to update athlete record" },
				{ status: 500 },
			);
		}

		const duration = Date.now() - startTime;
		console.log("=".repeat(80));
		console.log(
			`[Tally Poster Form] SUCCESS - Processed in ${duration}ms for ${athlete.full_name}`,
		);
		console.log(
			`[Tally Poster Form] Images uploaded: ${Object.keys(posterUrls).length}`,
		);
		console.log(`[Tally Poster Form] Videos uploaded: ${videoUrls.length}`);
		console.log("=".repeat(80));

		return NextResponse.json({
			success: true,
			athleteId,
			athleteName: athlete.full_name,
			imagesUploaded: Object.keys(posterUrls).length,
			videosUploaded: videoUrls.length,
			duration: `${duration}ms`,
			redirectUrl: CALENDLY_URL,
		});
	} catch (error) {
		console.error("[Tally Poster Form] Error:", error);
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
 * GET handler - returns webhook info
 */
export async function GET() {
	return NextResponse.json({
		name: "Tally Poster Form Webhook",
		description:
			"Receives poster form submissions from Tally and uploads images/videos to Supabase Storage",
		method: "POST",
		fields: {
			athleteId: "Hidden field with athlete UUID",
			eventsAndTimes: "Events & times to include on poster",
			standoutInfo: "Additional standout information",
			posterPrimary: "Primary poster image (required)",
			posterImage2: "2nd poster image (optional)",
			posterImage3: "3rd poster image (optional)",
			video1: "Additional video 1 (optional)",
			video2: "Additional video 2 (optional)",
		},
		storage: {
			images: "athlete-assets bucket",
			videos: "athlete-videos bucket",
		},
		redirectUrl: CALENDLY_URL,
	});
}
