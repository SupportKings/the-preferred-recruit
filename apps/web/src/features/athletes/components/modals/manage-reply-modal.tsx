"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createReply, updateReply } from "@/features/athletes/actions/replies";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { ApplicationLookup } from "../lookups/application-lookup";
import { CampaignLookup } from "../lookups/campaign-lookup";
import { UniversityJobLookup } from "../lookups/university-job-lookup";

interface ManageReplyModalProps {
	athleteId: string;
	campaignId?: string;
	mode: "add" | "edit";
	reply?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	allowCrossAthleteApplications?: boolean; // When true, search all athletes' applications
}

export function ManageReplyModal({
	athleteId,
	campaignId,
	mode,
	reply,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	allowCrossAthleteApplications = false,
}: ManageReplyModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		type: "email",
		occurred_at: format(new Date(), "yyyy-MM-dd"),
		summary: "",
		internal_notes: "",
		application_id: "",
		university_job_id: "",
		campaign_id: campaignId || "",
	});

	useEffect(() => {
		if (isEdit && reply) {
			setFormData({
				type: reply.type || "email",
				occurred_at: reply.occurred_at
					? format(new Date(reply.occurred_at), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				summary: reply.summary || "",
				internal_notes: reply.internal_notes || "",
				application_id: reply.application_id || "",
				university_job_id: reply.university_job_id || "",
				campaign_id: reply.campaign_id || "",
			});
		} else if (!isEdit) {
			setFormData({
				type: "email",
				occurred_at: format(new Date(), "yyyy-MM-dd"),
				summary: "",
				internal_notes: "",
				application_id: "",
				university_job_id: "",
				campaign_id: campaignId || "",
			});
		}
	}, [isEdit, reply, campaignId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.summary.trim()) {
			toast.error("Summary is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && reply) {
				await updateReply(reply.id, {
					type: formData.type,
					occurred_at: formData.occurred_at,
					summary: formData.summary,
					internal_notes: formData.internal_notes || undefined,
					application_id: formData.application_id || undefined,
					university_job_id: formData.university_job_id || undefined,
					campaign_id: formData.campaign_id || undefined,
				});
				toast.success("Reply updated successfully!");
			} else {
				await createReply(athleteId, {
					type: formData.type,
					occurred_at: formData.occurred_at,
					summary: formData.summary,
					internal_notes: formData.internal_notes || undefined,
					application_id: formData.application_id || undefined,
					university_job_id: formData.university_job_id || undefined,
					campaign_id: formData.campaign_id || undefined,
				});
				toast.success("Reply added successfully!");
			}

			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
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
							<Plus className="h-4 w-4" />
							Add Reply
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageCircle className="h-5 w-5" />
						{isEdit ? "Edit Reply" : "Add New Reply"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the reply details."
							: "Record a new coach reply for this athlete."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="type">Reply Type</Label>
						<Select
							value={formData.type}
							onValueChange={(value) =>
								setFormData({ ...formData, type: value })
							}
						>
							<SelectTrigger id="type">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="email">Email</SelectItem>
								<SelectItem value="call">Phone Call</SelectItem>
								<SelectItem value="text">Text/SMS</SelectItem>
								<SelectItem value="instagram">Instagram</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="occurred_at">Occurred At</Label>
						<DatePicker
							id="occurred_at"
							value={formData.occurred_at}
							onChange={(value) =>
								setFormData({ ...formData, occurred_at: value })
							}
							placeholder="When the reply happened"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="summary">Summary *</Label>
						<Textarea
							id="summary"
							placeholder="Short description of what was said or asked"
							value={formData.summary}
							onChange={(e) =>
								setFormData({ ...formData, summary: e.target.value })
							}
							rows={3}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this reply (optional)"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					<ApplicationLookup
						athleteId={allowCrossAthleteApplications ? undefined : athleteId}
						value={formData.application_id}
						onChange={(value) =>
							setFormData({ ...formData, application_id: value })
						}
						label="Application (Optional)"
						required={false}
					/>

					<UniversityJobLookup
						value={formData.university_job_id}
						onChange={(value) =>
							setFormData({ ...formData, university_job_id: value })
						}
						label="Coach/Job (Optional)"
						required={false}
					/>

					<CampaignLookup
						athleteId={athleteId}
						value={formData.campaign_id}
						onChange={(value) =>
							setFormData({ ...formData, campaign_id: value })
						}
						label="Campaign (Optional)"
						required={false}
						disabled={!!campaignId}
					/>

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
