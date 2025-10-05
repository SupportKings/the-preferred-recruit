import { type NextRequest, NextResponse } from "next/server";

import { StripeSync } from "@supabase/stripe-sync-engine";

interface RangeQueryParam {
	gt?: number;
	gte?: number;
	lt?: number;
	lte?: number;
}

interface BackfillRequest {
	object: string;
	created?: RangeQueryParam;
}

/**
 * API route to backfill specific Stripe entity with date filters
 *
 * Usage: POST /api/backfill
 * Body: {
 *   object: string, // 'product', 'customer', 'charge', etc.
 *   created?: { gte?: number, gt?: number, lte?: number, lt?: number } // Unix timestamps
 * }
 *
 * Example:
 * {
 *   "object": "product",
 *   "created": { "gte": 1643872333 }
 * }
 */
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		const body: BackfillRequest = await request.json();
		const { object, created } = body;

		// Validate required parameters
		if (!object) {
			return NextResponse.json(
				{ error: "Missing required parameter: object" },
				{ status: 400 },
			);
		}

		// Available objects to sync
		const availableObjects = [
			"all",
			"charge",
			"customer",
			"dispute",
			"invoice",
			"payment_method",
			"payment_intent",
			"plan",
			"price",
			"product",
			"setup_intent",
			"subscription",
		];

		if (!availableObjects.includes(object)) {
			return NextResponse.json(
				{
					error: `Invalid object: ${object}`,
					availableObjects,
				},
				{ status: 400 },
			);
		}

		// Environment variables
		const databaseUrl =
			process.env.DATABASE_URL || process.env.BETTER_AUTH_DATABASE_URL;
		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

		if (!databaseUrl || !stripeSecretKey || !stripeWebhookSecret) {
			return NextResponse.json(
				{
					error: "Missing required environment variables",
					required: [
						"DATABASE_URL or BETTER_AUTH_DATABASE_URL",
						"STRIPE_SECRET_KEY",
						"STRIPE_WEBHOOK_SECRET",
					],
				},
				{ status: 500 },
			);
		}

		// Initialize Stripe Sync Engine
		const sync = new StripeSync({
			databaseUrl,
			stripeSecretKey,
			stripeWebhookSecret,
			backfillRelatedEntities: true,
			autoExpandLists: true,
			maxPostgresConnections: 5,
			revalidateEntityViaStripeApi: true,
		});

		console.log(`Starting backfill for object: ${object}`);
		if (created) {
			console.log("Date filters:", created);

			// Log human-readable dates for debugging
			if (created.gte) {
				console.log(`From: ${new Date(created.gte * 1000).toISOString()}`);
			}
			if (created.gt) {
				console.log(`After: ${new Date(created.gt * 1000).toISOString()}`);
			}
			if (created.lte) {
				console.log(`Until: ${new Date(created.lte * 1000).toISOString()}`);
			}
			if (created.lt) {
				console.log(`Before: ${new Date(created.lt * 1000).toISOString()}`);
			}
		}

		const startTime = Date.now();

		// Run the backfill sync
		await sync.syncBackfill({
			object: object as any,
			...(created && { created }),
		});

		const endTime = Date.now();
		const duration = endTime - startTime;

		console.log(`✅ Completed backfill for ${object} in ${duration}ms`);

		return NextResponse.json({
			message: "Backfill completed successfully",
			object,
			created,
			duration: `${duration}ms`,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Backfill error:", error);
		return NextResponse.json(
			{
				error: "Backfill failed",
				details: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}

/**
 * Get backfill API information
 */
export async function GET() {
	return NextResponse.json({
		message: "Stripe Backfill API",
		usage: "POST to this endpoint to backfill specific Stripe entities",
		parameters: {
			object: "Required. Stripe object type to sync",
			created: "Optional. Date range filters using Unix timestamps",
		},
		availableObjects: [
			"all",
			"charge",
			"customer",
			"dispute",
			"invoice",
			"payment_method",
			"payment_intent",
			"plan",
			"price",
			"product",
			"setup_intent",
			"subscription",
		],
		examples: {
			"Backfill all products created after a specific date": {
				object: "product",
				created: { gte: 1643872333 },
			},
			"Backfill customers from a date range": {
				object: "customer",
				created: { gte: 1640995200, lte: 1643673600 },
			},
			"Backfill all invoices": {
				object: "invoice",
			},
		},
		createdFilters: {
			gt: "Greater than (exclusive)",
			gte: "Greater than or equal (inclusive)",
			lt: "Less than (exclusive)",
			lte: "Less than or equal (inclusive)",
		},
	});
}
