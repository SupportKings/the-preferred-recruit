"use client";

import { useQuery } from "@tanstack/react-query";
import { getBallKnowledge } from "../actions/getBallKnowledge";
import type { BallKnowledgeEntityType } from "../types/ball-knowledge";

interface UseBallKnowledgeParams {
	entityType: BallKnowledgeEntityType;
	entityId: string;
	page?: number;
	pageSize?: number;
	sortColumn?: "created_at" | "note" | "source_type" | "review_after";
	sortDirection?: "ASC" | "DESC";
	search?: string;
}

export function useBallKnowledge({
	entityType,
	entityId,
	page = 1,
	pageSize = 10,
	sortColumn = "created_at",
	sortDirection = "DESC",
	search,
}: UseBallKnowledgeParams) {
	return useQuery({
		queryKey: [
			"ball-knowledge",
			entityType,
			entityId,
			page,
			pageSize,
			sortColumn,
			sortDirection,
			search,
		],
		queryFn: async () => {
			console.log("Fetching ball knowledge for:", {
				entityType,
				entityId,
				page,
				pageSize,
			});

			const result = await getBallKnowledge({
				entityType,
				entityId,
				page,
				pageSize,
				sortColumn,
				sortDirection,
				search,
			});

			console.log("Ball knowledge result:", result);

			if (result?.serverError) {
				console.error("Ball knowledge server error:", result.serverError);
				throw new Error(result.serverError);
			}

			if (result?.validationErrors) {
				console.error("Ball knowledge validation errors:", result.validationErrors);
				throw new Error("Validation failed");
			}

			return result?.data || { data: [], totalCount: 0 };
		},
		staleTime: 30000, // 30 seconds
	});
}
