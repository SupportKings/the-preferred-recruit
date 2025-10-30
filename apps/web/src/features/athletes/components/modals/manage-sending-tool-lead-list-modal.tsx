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
	createSendingToolLeadList,
	updateSendingToolLeadList,
} from "@/features/athletes/actions/sendingToolLeadLists";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import { CampaignLookup } from "../lookups/campaign-lookup";

interface ManageSendingToolLeadListModalProps {
	athleteId: string;
	campaignId?: string;
	mode: "add" | "edit";
	list?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageSendingToolLeadListModal({
	athleteId,
	campaignId,
	mode,
	list,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageSendingToolLeadListModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		campaign_id: campaignId || "",
		format: "csv",
		row_count: "",
		file_url: "",
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && list) {
			setFormData({
				campaign_id: list.campaign_id || "",
				format: list.format || "csv",
				row_count: list.row_count?.toString() || "",
				file_url: list.file_url || "",
				internal_notes: list.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				campaign_id: campaignId || "",
				format: "csv",
				row_count: "",
				file_url: "",
				internal_notes: "",
			});
		}
	}, [isEdit, list, campaignId, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.campaign_id) {
			toast.error("Campaign is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && list) {
				await updateSendingToolLeadList(list.id, {
					format: formData.format,
					row_count: formData.row_count
						? Number.parseInt(formData.row_count, 10)
						: undefined,
					file_url: formData.file_url || undefined,
					internal_notes: formData.internal_notes,
				});
				toast.success("Sending tool list updated successfully!");
			} else {
				await createSendingToolLeadList({
					campaign_id: formData.campaign_id,
					format: formData.format,
					row_count: formData.row_count
						? Number.parseInt(formData.row_count, 10)
						: undefined,
					file_url: formData.file_url || undefined,
					internal_notes: formData.internal_notes,
				});
				toast.success("Sending tool list added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} sending tool list:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} sending tool list`);
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
							Add List
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileSpreadsheet className="h-5 w-5" />
						{isEdit ? "Edit Sending Tool List" : "Add New Sending Tool List"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the sending tool list details."
							: "Generate a new lead list for sending tools."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<CampaignLookup
						athleteId={athleteId}
						value={formData.campaign_id}
						onChange={(value) =>
							setFormData({ ...formData, campaign_id: value })
						}
						label="Campaign"
						required
						disabled={isEdit || !!campaignId}
					/>

					<div className="space-y-2">
						<Label htmlFor="format">Format</Label>
						<Select
							value={formData.format}
							onValueChange={(value) =>
								setFormData({ ...formData, format: value })
							}
						>
							<SelectTrigger id="format">
								<SelectValue placeholder="Select format" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="csv">CSV</SelectItem>
								<SelectItem value="xlsx">Excel (XLSX)</SelectItem>
								<SelectItem value="json">JSON</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="row_count">Row Count</Label>
						<Input
							id="row_count"
							type="number"
							placeholder="Number of rows in the file"
							value={formData.row_count}
							onChange={(e) =>
								setFormData({ ...formData, row_count: e.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="file_url">File URL</Label>
						<Input
							id="file_url"
							placeholder="URL to the generated file"
							value={formData.file_url}
							onChange={(e) =>
								setFormData({ ...formData, file_url: e.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Notes about this export"
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
									? "Update List"
									: "Add List"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
