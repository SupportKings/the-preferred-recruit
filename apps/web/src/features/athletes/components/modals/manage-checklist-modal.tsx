"use client";

import { type ReactElement, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
	createChecklistItem,
	getOrCreateChecklist,
	updateChecklistItem,
} from "@/features/athletes/actions/checklistItems";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageChecklistModalProps {
	athleteId: string;
	mode: "add" | "edit";
	checklistItem?: any;
	children?: ReactElement;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageChecklistModal({
	athleteId,
	mode,
	checklistItem,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageChecklistModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		checklist_id: "",
		template_item_id: "",
		title: "",
		description: "",
		sort_order: "",
		required: false,
		is_applicable: true,
	});

	// Auto-fetch or create the athlete's checklist when in add mode
	useEffect(() => {
		if (!isEdit && open && !formData.checklist_id) {
			const fetchOrCreateChecklist = async () => {
				try {
					const result = await getOrCreateChecklist(athleteId);
					if (result.success && result.data) {
						setFormData((prev) => ({
							...prev,
							checklist_id: result.data.id,
						}));
					}
				} catch (error) {
					console.error("Error fetching/creating checklist:", error);
					toast.error("Failed to create checklist");
				}
			};

			fetchOrCreateChecklist();
		}
	}, [isEdit, open, athleteId, formData.checklist_id]);

	useEffect(() => {
		if (isEdit && checklistItem) {
			setFormData({
				checklist_id: checklistItem.checklist_id || "",
				template_item_id: checklistItem.template_item_id || "",
				title: checklistItem.title || "",
				description: checklistItem.description || "",
				sort_order: checklistItem.sort_order?.toString() || "",
				required: checklistItem.required || false,
				is_applicable: checklistItem.is_applicable ?? true,
			});
		} else if (!isEdit) {
			// Create mode: only title field shown
			setFormData({
				checklist_id: "",
				template_item_id: "",
				title: "",
				description: "",
				sort_order: "",
				required: false,
				is_applicable: true,
			});
		}
	}, [isEdit, checklistItem, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("Title is required");
			return;
		}

		// For add mode, ensure we have a checklist_id
		if (!isEdit && !formData.checklist_id) {
			toast.error("Unable to create checklist. Please try again.");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && checklistItem) {
				await updateChecklistItem(checklistItem.id, {
					title: formData.title,
					description: formData.description,
					sort_order: formData.sort_order
						? Number.parseInt(formData.sort_order, 10)
						: undefined,
				});
				toast.success("Checklist item updated successfully!");
			} else {
				await createChecklistItem({
					checklist_id: formData.checklist_id,
					template_item_id: formData.template_item_id || undefined,
					title: formData.title,
					description: formData.description,
					sort_order: formData.sort_order
						? Number.parseInt(formData.sort_order, 10)
						: undefined,
				});
				toast.success("Checklist item added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} checklist item:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} checklist item`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger
					render={
						children || (
							<Button variant="outline" size="sm" className="gap-2">
								<Plus className="h-4 w-4" />
								Add Checklist Item
							</Button>
						)
					}
				/>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CheckSquare className="h-5 w-5" />
						{isEdit ? "Edit Checklist Item" : "Add New Checklist Item"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the checklist item details."
							: "Add a new item to the onboarding checklist."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Title - Required (only field shown in add mode) */}
					<div className="space-y-2">
						<Label htmlFor="title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							placeholder="Enter checklist item title"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							required
							autoFocus
						/>
					</div>

					{/* Edit mode only fields - per XML spec, CreateForm excludes these */}
					{isEdit && (
						<>
							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									placeholder="Details for completing the task"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={3}
								/>
							</div>

							{/* Sort Order */}
							<div className="space-y-2">
								<Label htmlFor="sort_order">Order</Label>
								<Input
									id="sort_order"
									type="number"
									placeholder="Ordering of the item within the checklist"
									value={formData.sort_order}
									onChange={(e) =>
										setFormData({ ...formData, sort_order: e.target.value })
									}
								/>
							</div>
						</>
					)}

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? isEdit
									? "Updating..."
									: "Adding..."
								: isEdit
									? "Update Item"
									: "Add Item"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
