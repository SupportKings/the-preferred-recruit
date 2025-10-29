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

import {
	createReply,
	updateReply,
} from "@/features/athlete-applications/actions/relations/replies";
import { applicationQueries } from "@/features/athlete-applications/queries/useApplications";
import { UniversityJobLookup } from "@/features/athletes/components/lookups/university-job-lookup";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageReplyModalProps {
	applicationId: string;
	mode: "add" | "edit";
	reply?: any;
	campaigns?: Array<{ id: string; name: string; type: string }>;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const replyTypes = ["call", "text", "email", "instagram_dm"];

export function ManageReplyModal({
	applicationId,
	mode,
	reply,
	campaigns = [],
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageReplyModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		type: "email" as string,
		occurred_at: "",
		summary: "",
		campaign_id: null as string | null,
		university_job_id: null as string | null,
		internal_notes: "",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && reply) {
			setFormData({
				type: reply.type || "email",
				occurred_at: reply.occurred_at
					? format(new Date(reply.occurred_at), "yyyy-MM-dd")
					: "",
				summary: reply.summary || "",
				campaign_id: reply.campaign_id || null,
				university_job_id: reply.university_job_id || null,
				internal_notes: reply.internal_notes || "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				type: "email",
				occurred_at: format(new Date(), "yyyy-MM-dd"),
				summary: "",
				campaign_id: null,
				university_job_id: null,
				internal_notes: "",
			});
		}
	}, [isEdit, reply]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.type || !formData.occurred_at) {
			toast.error("Reply type and date are required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && reply) {
				await updateReply(reply.id, {
					type: formData.type,
					occurred_at: formData.occurred_at,
					summary: formData.summary || null,
					campaign_id: formData.campaign_id || null,
					university_job_id: formData.university_job_id || null,
					internal_notes: formData.internal_notes || null,
				});
				toast.success("Reply updated successfully!");
			} else {
				await createReply(applicationId, {
					type: formData.type,
					occurred_at: formData.occurred_at,
					summary: formData.summary || null,
					campaign_id: formData.campaign_id || null,
					university_job_id: formData.university_job_id || null,
					internal_notes: formData.internal_notes || null,
				});
				toast.success("Reply added successfully!");
			}

			// Invalidate the application query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: applicationQueries.detail(applicationId),
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
							: "Log a new reply for this application."}
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
								{replyTypes.map((type) => (
									<SelectItem key={type} value={type}>
										{type
											.split("_")
											.map(
												(word) => word.charAt(0).toUpperCase() + word.slice(1),
											)
											.join(" ")}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="occurred_at">Occurred At *</Label>
						<DatePicker
							id="occurred_at"
							value={formData.occurred_at}
							onChange={(value) =>
								setFormData({ ...formData, occurred_at: value })
							}
							placeholder="Select date"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="summary">Summary</Label>
						<Textarea
							id="summary"
							placeholder="Brief summary of the reply"
							value={formData.summary}
							onChange={(e) =>
								setFormData({ ...formData, summary: e.target.value })
							}
							rows={3}
						/>
					</div>

					{/* Campaign and Coach fields only show in Create mode */}
					{!isEdit && (
						<>
							<div className="space-y-2">
								<Label htmlFor="campaign_id">Campaign (Optional)</Label>
								<Select
									value={formData.campaign_id || "NONE"}
									onValueChange={(value) =>
										setFormData({
											...formData,
											campaign_id: value === "NONE" ? null : value,
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select campaign..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="NONE">None</SelectItem>
										{campaigns.map((campaign) => (
											<SelectItem key={campaign.id} value={campaign.id}>
												{campaign.name} ({campaign.type})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<UniversityJobLookup
								label="Coach/Job (Optional)"
								value={formData.university_job_id || ""}
								onChange={(value) =>
									setFormData({
										...formData,
										university_job_id: value || null,
									})
								}
							/>
						</>
					)}

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this reply"
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
									? "Update Reply"
									: "Add Reply"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
