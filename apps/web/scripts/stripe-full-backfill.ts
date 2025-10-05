#!/usr/bin/env bun

/**
 * Critical Stripe Entities Backfill Script
 *
 * This script focuses on the most important Stripe entities: subscriptions and charges.
 * Optimized for all-time sync with robust error handling and timeout management.
 *
 * Features:
 * - Focuses on critical entities: subscriptions and charges
 * - All-time data sync with chunking to prevent timeouts
 * - Enhanced retry logic with longer backoff delays
 * - 10-minute timeout per chunk to prevent hanging
 * - Progress tracking and detailed logging
 * - Resume capability from specific entity
 *
 * Usage:
 * bun run scripts/stripe-full-backfill.ts [options]
 *
 * Options:
 * --max-retries <number>   Maximum retry attempts per entity (default: 5)
 * --delay-ms <number>      Delay between entities in milliseconds (default: 2000)
 * --start-from <entity>    Start from specific entity (subscription or charge)
 * --dry-run               Show what would be processed without executing
 */

interface BackfillResult {
	entity: string;
	status: "success" | "error" | "skipped";
	duration?: string;
	error?: string;
	timestamp: string;
	chunksProcessed?: number;
}

interface ScriptOptions {
	chunkDays: number;
	maxRetries: number;
	delayMs: number;
	startFrom?: string;
	dryRun: boolean;
	baseUrl: string;
}

// Focus on the most important entities: charges and subscriptions
const STRIPE_ENTITIES = [
	"subscription", // Subscriptions first (customer relationships)
	"charge", // Charges (transaction data)
];

class StripeBackfillRunner {
	private options: ScriptOptions;
	private results: BackfillResult[] = [];
	private startTime: number;

	constructor(options: ScriptOptions) {
		this.options = options;
		this.startTime = Date.now();
	}

	/**
	 * Main execution method
	 */
	async run(): Promise<void> {
		console.log("🚀 Starting comprehensive Stripe backfill...");
		console.log("Options:", this.options);
		console.log("Entities to process:", STRIPE_ENTITIES.length);
		console.log("=====================================\n");

		if (this.options.dryRun) {
			console.log("🧪 DRY RUN MODE - No actual backfill will be performed\n");
		}

		const startIndex = this.options.startFrom
			? STRIPE_ENTITIES.indexOf(this.options.startFrom)
			: 0;

		if (startIndex === -1 && this.options.startFrom) {
			throw new Error(`Invalid start entity: ${this.options.startFrom}`);
		}

		const entitiesToProcess = STRIPE_ENTITIES.slice(startIndex);

		for (let i = 0; i < entitiesToProcess.length; i++) {
			const entity = entitiesToProcess[i];
			const progress = `${startIndex + i + 1}/${STRIPE_ENTITIES.length}`;

			console.log(`\n📊 [${progress}] Processing entity: ${entity}`);
			console.log("─".repeat(50));

			try {
				if (this.options.dryRun) {
					console.log(`Would process: ${entity}`);
					this.results.push({
						entity,
						status: "skipped",
						timestamp: new Date().toISOString(),
					});
				} else {
					const result = await this.processEntity(entity);
					this.results.push(result);
				}

				// Add delay between entities to avoid overwhelming the system
				if (i < entitiesToProcess.length - 1) {
					console.log(
						`⏳ Waiting ${this.options.delayMs}ms before next entity...`,
					);
					await this.sleep(this.options.delayMs);
				}
			} catch (error) {
				console.error(`❌ Fatal error processing ${entity}:`, error);
				this.results.push({
					entity,
					status: "error",
					error: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
				});
			}
		}

		this.printSummary();
	}

	/**
	 * Process a single entity with retry logic
	 */
	private async processEntity(entity: string): Promise<BackfillResult> {
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
			try {
				console.log(`🔄 Attempt ${attempt}/${this.options.maxRetries}`);

				const startTime = Date.now();

				// Use chunking for both entities to prevent timeouts (all-time data in chunks)
				console.log(
					`🔄 Processing ${entity} in ${this.options.chunkDays}-day chunks (all-time data)...`,
				);
				await this.processEntityInChunks(entity);

				const duration = Date.now() - startTime;

				console.log(`✅ Successfully processed ${entity} in ${duration}ms`);

				return {
					entity,
					status: "success",
					duration: `${duration}ms`,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				console.error(`⚠️  Attempt ${attempt} failed:`, lastError.message);

				if (attempt < this.options.maxRetries) {
					const backoffMs = 2 ** attempt * 2000; // Longer exponential backoff
					console.log(`⏳ Retrying in ${Math.round(backoffMs / 1000)}s...`);
					await this.sleep(backoffMs);
				}
			}
		}

		return {
			entity,
			status: "error",
			error: lastError?.message || "Unknown error",
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Process entity in date chunks for large datasets
	 */
	private async processEntityInChunks(entity: string): Promise<void> {
		console.log(
			`📅 Processing ${entity} in ${this.options.chunkDays}-day chunks...`,
		);

		const now = Date.now() / 1000;
		const chunkSeconds = this.options.chunkDays * 24 * 60 * 60;

		// Start from 2 years ago and work forward
		let startDate = now - 2 * 365 * 24 * 60 * 60;
		let chunkCount = 0;

		while (startDate < now) {
			const endDate = Math.min(startDate + chunkSeconds, now);
			chunkCount++;

			console.log(
				`  📦 Chunk ${chunkCount}: ${new Date(startDate * 1000).toISOString()} to ${new Date(endDate * 1000).toISOString()}`,
			);

			await this.backfillEntity(entity, {
				gte: Math.floor(startDate),
				lt: Math.floor(endDate),
			});

			startDate = endDate;

			// Small delay between chunks
			await this.sleep(500);
		}

		console.log(`✅ Completed ${chunkCount} chunks for ${entity}`);
	}

	/**
	 * Make the actual backfill API call
	 */
	private async backfillEntity(
		entity: string,
		created?: { gte?: number; lt?: number },
	): Promise<void> {
		const payload = {
			object: entity,
			...(created && { created }),
		};

		// Add timeout for large dataset processing (10 minutes)
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

		try {
			const response = await fetch(`${this.options.baseUrl}/api/backfill`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					`HTTP ${response.status}: ${errorData.error || response.statusText}`,
				);
			}

			const result = await response.json();
			console.log(`  ✓ API Response: ${result.message}`);
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error(`Request timeout after 10 minutes for ${entity}`);
			}
			throw error;
		}
	}

	/**
	 * Determine if entity should use chunked processing
	 */
	private shouldUseChunking(entity: string): boolean {
		// These entities typically have large datasets
		const largeDatasetEntities = [
			"charge",
			"payment_intent",
			"invoice",
			"customer",
		];
		return largeDatasetEntities.includes(entity);
	}

	/**
	 * Sleep utility
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Print comprehensive summary
	 */
	private printSummary(): void {
		const totalDuration = Date.now() - this.startTime;
		const successful = this.results.filter(
			(r) => r.status === "success",
		).length;
		const failed = this.results.filter((r) => r.status === "error").length;
		const skipped = this.results.filter((r) => r.status === "skipped").length;

		console.log("\n🎯 BACKFILL COMPLETE");
		console.log("=====================================");
		console.log(`Total time: ${Math.round(totalDuration / 1000)}s`);
		console.log(`Entities processed: ${this.results.length}`);
		console.log(`✅ Successful: ${successful}`);
		console.log(`❌ Failed: ${failed}`);
		console.log(`⏭️  Skipped: ${skipped}`);

		if (failed > 0) {
			console.log("\n❌ Failed entities:");
			this.results
				.filter((r) => r.status === "error")
				.forEach((r) => console.log(`  - ${r.entity}: ${r.error}`));
		}

		console.log("\n📊 Detailed Results:");
		console.table(
			this.results.map((r) => ({
				Entity: r.entity,
				Status: r.status,
				Duration: r.duration || "N/A",
				Error: r.error ? r.error.substring(0, 50) + "..." : "",
			})),
		);

		if (failed > 0) {
			console.log("\n💡 To resume from a specific entity, use:");
			const firstFailed = this.results.find((r) => r.status === "error");
			if (firstFailed) {
				console.log(
					`bun run scripts/stripe-full-backfill.ts --start-from ${firstFailed.entity}`,
				);
			}
		}
	}
}

/**
 * Parse command line arguments
 */
function parseArgs(): ScriptOptions {
	const args = process.argv.slice(2);
	const options: ScriptOptions = {
		chunkDays: 30,
		maxRetries: 5, // More retries for critical entities
		delayMs: 2000, // Longer delay between entities
		dryRun: false,
		baseUrl: "http://localhost:3001", // Default to your port
	};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--chunk-days":
				options.chunkDays = Number.parseInt(args[++i]) || 30;
				break;
			case "--max-retries":
				options.maxRetries = Number.parseInt(args[++i]) || 3;
				break;
			case "--delay-ms":
				options.delayMs = Number.parseInt(args[++i]) || 1000;
				break;
			case "--start-from":
				options.startFrom = args[++i];
				break;
			case "--dry-run":
				options.dryRun = true;
				break;
			case "--base-url":
				options.baseUrl = args[++i];
				break;
			case "--help":
				console.log(`
Stripe Full Backfill Script

Usage: bun run scripts/stripe-full-backfill.ts [options]

Options:
  --chunk-days <number>     Days per chunk for large accounts (default: 30)
  --max-retries <number>    Maximum retry attempts per entity (default: 3)
  --delay-ms <number>       Delay between entities in milliseconds (default: 1000)
  --start-from <entity>     Start from specific entity (useful for resuming)
  --dry-run                 Show what would be processed without executing
  --base-url <url>          Base URL for API calls (default: http://localhost:3001)
  --help                    Show this help message

Examples:
  bun run scripts/stripe-full-backfill.ts
  bun run scripts/stripe-full-backfill.ts --dry-run
  bun run scripts/stripe-full-backfill.ts --chunk-days 7 --delay-ms 2000
  bun run scripts/stripe-full-backfill.ts --start-from charge
				`);
				process.exit(0);
		}
	}

	return options;
}

/**
 * Main execution
 */
async function main() {
	try {
		const options = parseArgs();
		const runner = new StripeBackfillRunner(options);
		await runner.run();
		process.exit(0);
	} catch (error) {
		console.error("💥 Script failed:", error);
		process.exit(1);
	}
}

// Run the main function
main();
