import { type NextRequest, NextResponse } from "next/server";

import {
	type TallyWebhookPayload,
	verifyTallySignature,
} from "@/lib/tally-webhook";

// ============================================================================
// Webhook Handler for Athlete Poster Form
// ============================================================================

export async function POST(request: NextRequest) {
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

		console.log("=".repeat(80));
		console.log("[Tally Poster Form] WEBHOOK RECEIVED");
		console.log("=".repeat(80));
		console.log(
			`[Tally Poster Form] Form: "${payload.data.formName}" (ID: ${payload.data.formId})`,
		);
		console.log(
			`[Tally Poster Form] Submission ID: ${payload.data.submissionId}`,
		);
		console.log(`[Tally Poster Form] Created At: ${payload.data.createdAt}`);
		console.log("-".repeat(80));
		console.log("[Tally Poster Form] FULL PAYLOAD:");
		console.log(JSON.stringify(payload, null, 2));
		console.log("-".repeat(80));
		console.log("[Tally Poster Form] FIELDS SUMMARY:");

		// Log each field with its type and value for easy mapping
		for (const field of payload.data.fields) {
			const valuePreview =
				field.type === "FILE_UPLOAD"
					? `[${(field.value as Array<{ name: string }>)?.length || 0} file(s)]`
					: typeof field.value === "string"
						? field.value.substring(0, 100) +
							(field.value.length > 100 ? "..." : "")
						: JSON.stringify(field.value);

			console.log(
				`  - "${field.label}" (key: ${field.key}, type: ${field.type}): ${valuePreview}`,
			);
		}

		console.log("=".repeat(80));

		return NextResponse.json({
			success: true,
			message: "Payload logged - check server logs for field mapping",
			submissionId: payload.data.submissionId,
			formName: payload.data.formName,
			fieldCount: payload.data.fields.length,
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
		description: "Receives poster form submissions from Tally",
		method: "POST",
	});
}
