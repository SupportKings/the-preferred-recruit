"use client";

import { type ReactNode, useEffect, useState } from "react";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
	createSchoolLeadList,
	updateSchoolLeadList,
} from "@/features/athletes/actions/schoolLeadLists";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { List, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageLeadListModalProps {
	athleteId: string;
	mode: "add" | "edit";
	leadList?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageLeadListModal({
	athleteId,
	mode,
	leadList,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageLeadListModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		name: "",
		priority: "",
		type: "",
		season_label: "",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && leadList) {
			setFormData({
				name: leadList.name || "",
				priority: leadList.priority?.toString() || "",
				type: leadList.type || "",
				season_label: leadList.season_label || "",
				internal_notes: leadList.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				name: "",
				priority: "",
				type: "",
				season_label: "",
				internal_notes: "",
			});
		}
	}, [isEdit, leadList]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.name.trim()) {
			toast.error("List name is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && leadList) {
				await updateSchoolLeadList(leadList.id, {
					name: formData.name,
					priority: formData.priority
						? Number.parseInt(formData.priority, 10)
						: undefined,
					type: formData.type,
					season_label: formData.season_label,
					internal_notes: formData.internal_notes,
				});
				toast.success("Lead list updated successfully!");
			} else {
				await createSchoolLeadList(athleteId, {
					name: formData.name,
					priority: formData.priority
						? Number.parseInt(formData.priority, 10)
						: undefined,
					type: formData.type,
					season_label: formData.season_label,
					internal_notes: formData.internal_notes,
				});
				toast.success("Lead list added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} lead list:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} lead list`);
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
							Add Lead List
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<List className="h-5 w-5" />
						{isEdit ? "Edit Lead List" : "Add New Lead List"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the lead list details."
							: "Create a new lead list for targeting schools."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Name */}
					<div>
						<Label htmlFor="name">List Name *</Label>
						<Input
							id="name"
							placeholder="e.g., Fall D2 Targets"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>
					</div>

					{/* Priority */}
					<div>
						<Label htmlFor="priority">Priority</Label>
						<Input
							id="priority"
							type="number"
							placeholder="e.g., 1"
							value={formData.priority}
							onChange={(e) =>
								setFormData({ ...formData, priority: e.target.value })
							}
						/>
					</div>

					{/* Type */}
					<div>
						<Label htmlFor="type">Type</Label>
						<Select
							value={formData.type || "none"}
							onValueChange={(value) =>
								setFormData({
									...formData,
									type: value === "none" ? "" : value,
								})
							}
						>
							<SelectTrigger id="type">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" disabled>
									Select type
								</SelectItem>
								<SelectItem value="d1">Division I</SelectItem>
								<SelectItem value="d2">Division II</SelectItem>
								<SelectItem value="d3">Division III</SelectItem>
								<SelectItem value="naia">NAIA</SelectItem>
								<SelectItem value="juco">Junior College</SelectItem>
								<SelectItem value="reach">Reach Schools</SelectItem>
								<SelectItem value="target">Target Schools</SelectItem>
								<SelectItem value="safety">Safety Schools</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Season Label */}
					<div>
						<Label htmlFor="season_label">Season Label</Label>
						<Input
							id="season_label"
							placeholder="e.g., Fall 2024"
							value={formData.season_label}
							onChange={(e) =>
								setFormData({ ...formData, season_label: e.target.value })
							}
						/>
					</div>

					{/* Internal Notes */}
					<div>
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes for this list"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

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
									? "Update Lead List"
									: "Add Lead List"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
