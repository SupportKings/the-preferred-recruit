"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";
import type { BallKnowledgeWithRelations } from "../types/ball-knowledge";

const getBallKnowledgeSchema = z.object({
	entityType: z.enum(["coach", "university", "program"]),
	entityId: z.string().uuid(),
	page: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
	sortColumn: z
		.enum(["created_at", "note", "source_type", "review_after"])
		.default("created_at"),
	sortDirection: z.enum(["ASC", "DESC"]).default("DESC"),
	search: z.string().optional(),
});

export const getBallKnowledge = actionClient
	.inputSchema(getBallKnowledgeSchema)
	.action(async ({ parsedInput }) => {
		console.log("getBallKnowledge action called with:", parsedInput);

		const supabase = await createClient();

		const functionName =
			parsedInput.entityType === "coach"
				? "get_ball_knowledge_for_coach"
				: parsedInput.entityType === "university"
					? "get_ball_knowledge_for_university"
					: "get_ball_knowledge_for_program";

		const paramName =
			parsedInput.entityType === "coach"
				? "p_coach_id"
				: parsedInput.entityType === "university"
					? "p_university_id"
					: "p_program_id";

		const rpcParams = {
			[paramName]: parsedInput.entityId,
			p_page: parsedInput.page,
			p_page_size: parsedInput.pageSize,
			p_sort_column: parsedInput.sortColumn,
			p_sort_direction: parsedInput.sortDirection,
			p_search: parsedInput.search || null,
		};

		const { data, error } = await supabase.rpc(functionName, rpcParams);

		if (error) {
			console.error("Ball knowledge RPC error:", {
				error,
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code,
				functionName,
				rpcParams,
			});
			throw new Error(`Failed to fetch ball knowledge: ${error.message}`);
		}

		return {
			data: data as BallKnowledgeWithRelations[],
			totalCount: data?.[0]?.total_count || 0,
		};
	});
