"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteBallKnowledge } from "../actions/deleteBallKnowledge";
import { useBallKnowledge } from "../queries/useBallKnowledge";
import type {
	BallKnowledgeEntityType,
	BallKnowledgeWithRelations,
} from "../types/ball-knowledge";
import { DeleteBallKnowledgeModal } from "./modals/delete-ball-knowledge-modal";
import { ManageBallKnowledgeModal } from "./modals/manage-ball-knowledge-modal";
import { createBallKnowledgeColumns } from "./table-columns/ball-knowledge-columns";

interface BallKnowledgeSectionProps {
	entityType: BallKnowledgeEntityType;
	entityId: string;
	defaultAboutCoachId?: string;
	defaultAboutUniversityId?: string;
	defaultAboutProgramId?: string;
}

export function BallKnowledgeSection({
	entityType,
	entityId,
	defaultAboutCoachId,
	defaultAboutUniversityId,
	defaultAboutProgramId,
}: BallKnowledgeSectionProps) {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<
		BallKnowledgeWithRelations | undefined
	>();
	const [deletingItem, setDeletingItem] = useState<
		BallKnowledgeWithRelations | undefined
	>();
	const [page] = useState(1);
	const [pageSize] = useState(10);

	const { data, refetch } = useBallKnowledge({
		entityType,
		entityId,
		page,
		pageSize,
	});

	const handleEdit = (item: BallKnowledgeWithRelations) => {
		setEditingItem(item);
	};

	const handleDelete = (item: BallKnowledgeWithRelations) => {
		setDeletingItem(item);
	};

	const handleConfirmDelete = async () => {
		if (!deletingItem) return;

		const result = await deleteBallKnowledge({ id: deletingItem.id });

		if (result?.serverError) {
			toast.error(result.serverError);
		} else {
			toast.success("Ball knowledge deleted successfully");
			refetch();
		}
	};

	const columns = createBallKnowledgeColumns(handleEdit, handleDelete);

	const table = useReactTable({
		data: data?.data || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: Math.ceil((data?.totalCount || 0) / pageSize),
	});

	const hasNoData = !data?.data || data.data.length === 0;

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Ball Knowledge</CardTitle>
					<Button onClick={() => setIsAddModalOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Note
					</Button>
				</CardHeader>
				<CardContent>
					{hasNoData ? (
						<div className="py-8 text-center text-muted-foreground">
							<BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p className="text-sm">No ball knowledge yet</p>
							<p className="mt-1 text-xs">Notes will appear here once added</p>
						</div>
					) : (
						<UniversalDataTable
							table={table}
							totalCount={data?.totalCount || 0}
							emptyStateMessage="No ball knowledge found"
						/>
					)}
				</CardContent>
			</Card>

			{/* Add Modal */}
			<ManageBallKnowledgeModal
				mode="add"
				open={isAddModalOpen}
				onOpenChange={setIsAddModalOpen}
				defaultAboutCoachId={defaultAboutCoachId}
				defaultAboutUniversityId={defaultAboutUniversityId}
				defaultAboutProgramId={defaultAboutProgramId}
			/>

			{/* Edit Modal */}
			{editingItem && (
				<ManageBallKnowledgeModal
					mode="edit"
					ballKnowledge={editingItem}
					open={!!editingItem}
					onOpenChange={(open) => !open && setEditingItem(undefined)}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<DeleteBallKnowledgeModal
				isOpen={!!deletingItem}
				onOpenChange={(open) => !open && setDeletingItem(undefined)}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}
