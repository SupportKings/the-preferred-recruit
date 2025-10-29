"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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

import { AthleteLookup } from "@/features/athletes/components/lookups/athlete-lookup";
import { CampaignLookup } from "@/features/athletes/components/lookups/campaign-lookup";
import { universityJobQueries } from "@/features/university-jobs/queries/useUniversityJobs";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { createReply, updateReply } from "../actions/relations/replies";

interface ManageReplyModalProps {
	universityJobId: string;
	mode: "add" | "edit";
	reply?: unknown;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageReplyModal({
	universityJobId,
	mode,
	reply,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageReplyModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		type: "email" as string,
		occurred_at: format(new Date(), "yyyy-MM-dd"),
		summary: "",
		campaign_id: null as string | null,
		athlete_id: null as string | null,
		internal_notes: "",
	});

	useEffect(() => {
		if (isEdit && reply) {
			const rep = reply as {
				type?: string | null;
				occurred_at?: string | null;
				summary?: string | null;
				campaigns?: { id: string } | null;
				athletes?: { id: string } | null;
				internal_notes?: string | null;
			};
			setFormData({
				type: rep.type || "email",
				occurred_at: rep.occurred_at
					? format(new Date(rep.occurred_at), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				summary: rep.summary || "",
				campaign_id: rep.campaigns?.id || null,
				athlete_id: rep.athletes?.id || null,
				internal_notes: rep.internal_notes || "",
			});
		} else if (!isEdit) {
			setFormData({
				type: "email",
				occurred_at: format(new Date(), "yyyy-MM-dd"),
				summary: "",
				campaign_id: null,
				athlete_id: null,
				internal_notes: "",
			});
		}
	}, [isEdit, reply]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			if (isEdit && reply) {
				const rep = reply as { id: string };
				await updateReply(rep.id, {
					type: formData.type,
					occurred_at: formData.occurred_at,
					summary: formData.summary,
					internal_notes: formData.internal_notes,
				});
				toast.success("Reply updated successfully!");
			} else {
				await createReply(universityJobId, formData);
				toast.success("Reply added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: universityJobQueries.detail(universityJobId),
			});

			setOpen(false);
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} reply:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} reply`);
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
							{isEdit ? (
								<Edit className="h-4 w-4" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							{isEdit ? "Edit Reply" : "Add Reply"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						{isEdit ? "Edit Reply" : "Add New Reply"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the reply details."
							: "Add a new reply for this position."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="type">Reply Type *</Label>
						<Select
							value={formData.type}
							onValueChange={(value) =>
								setFormData({ ...formData, type: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="call">Call</SelectItem>
								<SelectItem value="text">Text</SelectItem>
								<SelectItem value="email">Email</SelectItem>
								<SelectItem value="instagram">Instagram DM</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="occurred_at">Occurred At *</Label>
						<Input
							id="occurred_at"
							type="date"
							value={formData.occurred_at}
							onChange={(e) =>
								setFormData({ ...formData, occurred_at: e.target.value })
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="summary">Summary</Label>
						<Textarea
							id="summary"
							placeholder="Brief summary of the reply..."
							value={formData.summary}
							onChange={(e) =>
								setFormData({ ...formData, summary: e.target.value })
							}
							rows={3}
						/>
					</div>

					{!isEdit && (
						<>
							<div className="space-y-2">
								<Label htmlFor="campaign_id">Campaign</Label>
								<CampaignLookup
									value={formData.campaign_id || ""}
									onChange={(value) =>
										setFormData({ ...formData, campaign_id: value || null })
									}
									label=""
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="athlete_id">Athlete</Label>
								<AthleteLookup
									value={formData.athlete_id || ""}
									onChange={(value) =>
										setFormData({ ...formData, athlete_id: value || null })
									}
									label=""
								/>
							</div>
						</>
					)}

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this reply..."
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={2}
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
									? "Update Reply"
									: "Add Reply"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
