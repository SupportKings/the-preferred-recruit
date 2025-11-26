import { task } from "@trigger.dev/sdk/v3";
import { supabase } from "../lib/database";
import type { CoachRow } from "../lib/excel-parser";
import {
	deduplicateByUniqueId,
	filterInvalidRows,
	parseExcelFile,
} from "../lib/excel-parser";
import { processCoachData } from "../lib/data-mapper";

interface CoachImportPayload {
	jobId: string;
	fileUrl: string;
}

interface CoachBatchPayload {
	jobId: string;
	coaches: CoachRow[];
	batchNumber: number;
}

interface CoachImportResult {
	success: boolean;
	processed: number;
	successCount: number;
	errorCount: number;
	errors?: Array<{
		row: number;
		error: string;
		uniqueId?: string;
		coachName?: string;
		school?: string;
	}>;
}

interface CoachBatchResult {
	successCount: number;
	errorCount: number;
	errors: Array<{
		row: number;
		error: string;
		uniqueId?: string;
		coachName?: string;
		school?: string;
	}>;
}

export const processCoachImport = task({
	id: "process-coach-import",
	queue: {
		name: "coach-imports",
		concurrencyLimit: 2, // Process max 2 imports simultaneously
	},
	run: async (payload: CoachImportPayload): Promise<CoachImportResult> => {
		const { jobId, fileUrl } = payload;

		console.log(`[Coach Import] Starting job ${jobId}`);
		console.log(`[Coach Import] File URL: ${fileUrl}`);

		// Step 1: Update job status to processing
		await updateJobStatus(jobId, "processing");

		try {
			// Step 2: Download and parse Excel file
			console.log(`[Coach Import] Parsing Excel file...`);
			const sheets = await parseExcelFile(fileUrl);

			// Step 3: Filter invalid rows
			console.log(`[Coach Import] Filtering invalid rows...`);
			const validRows = filterInvalidRows(sheets);

			// Step 4: Deduplicate by unique_id
			console.log(`[Coach Import] Deduplicating rows...`);
			const dedupedRows = deduplicateByUniqueId(validRows);

			console.log(
				`[Coach Import] Processing ${dedupedRows.length} unique coaches`,
			);

			// Update total_rows count
			await supabase
				.from("coach_import_jobs")
				.update({ total_rows: dedupedRows.length })
				.eq("id", jobId);

			// Step 5: Trigger batches in groups to avoid payload size limits
			const batchSize = 50; // Process 50 coaches per child task
			const groupSize = 20; // Trigger 20 batches at a time (avoids "Request body too large")

			const totalBatches = Math.ceil(dedupedRows.length / batchSize);
			console.log(`[Coach Import] Triggering ${totalBatches} batches in groups of ${groupSize}`);

			let successCount = 0;
			let errorCount = 0;
			const errors: Array<{ row: number; error: string; uniqueId?: string }> = [];

			// Trigger batches in groups SEQUENTIALLY (Trigger.dev doesn't support parallel waits)
			for (let groupStart = 0; groupStart < totalBatches; groupStart += groupSize) {
				const groupEnd = Math.min(groupStart + groupSize, totalBatches);
				const batchPayloads: Array<{ payload: CoachBatchPayload }> = [];

				// Create batch payloads for this group
				for (let batchNum = groupStart; batchNum < groupEnd; batchNum++) {
					const start = batchNum * batchSize;
					const end = Math.min(start + batchSize, dedupedRows.length);
					const batchCoaches = dedupedRows.slice(start, end);

					batchPayloads.push({
						payload: {
							jobId,
							coaches: batchCoaches,
							batchNumber: batchNum + 1,
						},
					});
				}

				console.log(`[Coach Import] Triggering group ${Math.floor(groupStart / groupSize) + 1} (batches ${groupStart + 1}-${groupEnd})`);

				// Trigger this group and wait for completion before starting next group
				const result = await processCoachBatch.batchTriggerAndWait(batchPayloads);

				// Process results from this group
				for (const run of result.runs) {
					if (run.ok) {
						successCount += run.output.successCount;
						errorCount += run.output.errorCount;
						errors.push(...run.output.errors);
					} else {
						console.error(`[Coach Import] Batch failed: ${run.error}`);
						errorCount += 50; // Assume all coaches in failed batch errored
					}
				}
			}

			console.log(`[Coach Import] All batches complete, aggregating results...`);
			console.log(`[Coach Import] Total: ${successCount} success, ${errorCount} errors`);

			// Step 6: Mark as completed or failed
			const finalStatus = successCount === 0 ? "failed" : "completed";
			console.log(
				`[Coach Import] ${finalStatus}! Success: ${successCount}, Errors: ${errorCount}`,
			);

			await supabase
				.from("coach_import_jobs")
				.update({
					status: finalStatus,
					completed_at: new Date().toISOString(),
					success_count: successCount,
					error_count: errorCount,
					error_log: errors.length > 0 ? errors : null,
				})
				.eq("id", jobId);

			return {
				success: true,
				processed: dedupedRows.length,
				successCount,
				errorCount,
				errors: errors.slice(0, 100), // Limit to first 100 errors in response
			};
		} catch (error) {
			// Fatal error - mark job as failed
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`[Coach Import] Fatal error: ${errorMessage}`);

			await supabase
				.from("coach_import_jobs")
				.update({
					status: "failed",
					completed_at: new Date().toISOString(),
					error_log: [
						{
							error: errorMessage,
							stack: error instanceof Error ? error.stack : undefined,
						},
					],
				})
				.eq("id", jobId);

			throw error; // Let Trigger.dev handle retries
		}
	},
});

async function updateJobStatus(
	jobId: string,
	status: "pending" | "processing" | "completed" | "failed",
): Promise<void> {
	const update: any = { status };

	if (status === "processing") {
		update.started_at = new Date().toISOString();
	}

	await supabase.from("coach_import_jobs").update(update).eq("id", jobId);
}

// Child task: Process a batch of coaches in parallel
export const processCoachBatch = task({
	id: "process-coach-batch",
	queue: {
		name: "coach-batch-processing",
		concurrencyLimit: 10, // Process up to 10 batches in parallel
	},
	run: async (payload: CoachBatchPayload): Promise<CoachBatchResult> => {
		const { jobId, coaches, batchNumber } = payload;

		console.log(`[Batch ${batchNumber}] Processing ${coaches.length} coaches`);

		let successCount = 0;
		let errorCount = 0;
		const errors: Array<{
			row: number;
			error: string;
			uniqueId?: string;
			coachName?: string;
			school?: string;
		}> = [];

		for (const row of coaches) {
			try {
				await processCoachData(row, supabase);
				successCount++;
			} catch (error) {
				errorCount++;
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				const coachName = `${row["First name"] || ""} ${row["Last name"] || ""}`.trim();
				errors.push({
					row: coaches.indexOf(row),
					error: errorMessage,
					uniqueId: row["Unique ID"],
					coachName: coachName || undefined,
					school: row.School || undefined,
				});
				console.error(
					`[Batch ${batchNumber}] Error processing ${row["Unique ID"]} (${coachName} at ${row.School}): ${errorMessage}`,
				);
			}
		}

		console.log(`[Batch ${batchNumber}] Complete: ${successCount} success, ${errorCount} errors`);

		// Update job progress
		await supabase.rpc("increment_coach_import_progress", {
			p_job_id: jobId,
			p_success_count: successCount,
			p_error_count: errorCount,
		});

		return {
			successCount,
			errorCount,
			errors,
		};
	},
});
