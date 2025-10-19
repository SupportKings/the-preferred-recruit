"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	updateChecklistItem,
} from "@/features/athletes/actions/checklistItems";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { ChecklistLookup } from "../lookups/checklist-lookup";
import { TemplateItemLookup } from "../lookups/template-item-lookup";

interface ManageChecklistModalProps {
	athleteId: string;
	mode: "add" | "edit";
	checklistItem?: any;
	children?: ReactNode;
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
			// Create mode: only minimal fields per XML CreateForm spec
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
	}, [isEdit, checklistItem]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.checklist_id) {
			toast.error("Checklist is required");
			return;
		}

		if (!formData.title.trim()) {
			toast.error("Title is required");
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
					required: formData.required,
					is_applicable: formData.is_applicable,
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
					required: formData.required,
					is_applicable: formData.is_applicable,
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
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							Add Checklist Item
						</Button>
					)}
				</DialogTrigger>
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
					{/* Checklist - Required */}
					<ChecklistLookup
						athleteId={athleteId}
						value={formData.checklist_id}
						onChange={(value) =>
							setFormData({ ...formData, checklist_id: value })
						}
						label="Onboarding Checklist"
						required
					/>

					{/* Template Item - Optional */}
					<TemplateItemLookup
						value={formData.template_item_id}
						onChange={(value) =>
							setFormData({ ...formData, template_item_id: value })
						}
						label="Template Item"
						required={false}
					/>

					{/* Title - Required */}
					<div className="space-y-2">
						<Label htmlFor="title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							placeholder="Action title for this checklist item"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							required
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

							{/* Checkboxes */}
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="required"
										checked={formData.required}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, required: !!checked })
										}
									/>
									<Label htmlFor="required" className="cursor-pointer">
										Required?
									</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="is_applicable"
										checked={formData.is_applicable}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, is_applicable: !!checked })
										}
									/>
									<Label htmlFor="is_applicable" className="cursor-pointer">
										Applicable?
									</Label>
								</div>
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
