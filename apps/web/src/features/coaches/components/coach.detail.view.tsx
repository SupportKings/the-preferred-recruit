"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BallKnowledgeSection } from "@/features/ball-knowledge/components/ball-knowledge-section";
import { deleteCampaignLead } from "@/features/campaigns/actions/relations/deleteCampaignLead";
import { deleteUniversityJob } from "@/features/university-jobs/actions/deleteUniversityJob";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateCoachAction } from "../actions/updateCoach";
import { coachQueries, useCoach } from "../queries/useCoaches";
import { CoachCampaignLeadsSection } from "./detail-sections/coach-campaign-leads-section";
import { CoachContactSocial } from "./detail-sections/coach-contact-social";
import { CoachIdentityRole } from "./detail-sections/coach-identity-role";
import { CoachSystemInfo } from "./detail-sections/coach-system-info";
import { CoachUniversityJobsSection } from "./detail-sections/coach-university-jobs-section";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface CoachDetailViewProps {
	coachId: string;
}

export default function CoachDetailView({ coachId }: CoachDetailViewProps) {
	const { data: coach, isLoading, error } = useCoach(coachId);
	const queryClient = useQueryClient();

	// Delete modal state
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}>({ isOpen: false, type: "", id: "", title: "" });

	// Edit state for basic info sections
	const [editState, setEditState] = useState<{
		isEditing: boolean;
		section: "identity" | "contact" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "identity" | "contact") => {
		if (editState.isEditing && editState.section === section) {
			// Cancel edit
			setEditState({ isEditing: false, section: null });
		} else {
			// Start edit
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (
		data:
			| {
					full_name: string;
					primary_specialty: string;
					internal_notes: string;
			  }
			| {
					email: string;
					phone: string;
					twitter_profile: string;
					linkedin_profile: string;
					instagram_profile: string;
			  },
	) => {
		try {
			// Transform form data to match the updateCoachSchema format
			const updateData: Record<string, unknown> = {
				id: coachId,
			};

			// Only include fields from the section being edited
			if (editState.section === "identity" && "full_name" in data) {
				// Identity & Role fields
				updateData.full_name = data.full_name;
				updateData.primary_specialty = data.primary_specialty || "";
				updateData.internal_notes = data.internal_notes || "";
			} else if (editState.section === "contact" && "email" in data) {
				// Contact & Social fields
				updateData.email = data.email || "";
				updateData.phone = data.phone || "";
				updateData.twitter_profile = data.twitter_profile || "";
				updateData.linkedin_profile = data.linkedin_profile || "";
				updateData.instagram_profile = data.instagram_profile || "";
			}

			// Call the update action
			const result = await updateCoachAction(
				updateData as Parameters<typeof updateCoachAction>[0],
			);

			if (result?.validationErrors) {
				// Handle validation errors
				const errorMessages: string[] = [];

				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}

				// Handle field-specific errors
				Object.entries(result.validationErrors).forEach(([field, errors]) => {
					if (field !== "_errors" && errors) {
						if (Array.isArray(errors)) {
							errorMessages.push(...errors);
						} else if (
							errors &&
							typeof errors === "object" &&
							"_errors" in errors &&
							Array.isArray(errors._errors)
						) {
							errorMessages.push(...errors._errors);
						}
					}
				});

				if (errorMessages.length > 0) {
					for (const error of errorMessages) {
						toast.error(error);
					}
				} else {
					toast.error("Failed to update coach");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Coach updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: coachQueries.detail(coachId),
				});
			} else {
				toast.error("Failed to update coach");
			}
		} catch (error) {
			console.error("Error updating coach:", error);
			toast.error("Failed to update coach");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			let result;
			let successMessage = "";

			switch (deleteModal.type) {
				case "university_job": {
					result = await deleteUniversityJob({ id: deleteModal.id });
					successMessage = "University job deleted successfully";
					break;
				}
				case "campaign_lead": {
					result = await deleteCampaignLead({ id: deleteModal.id });
					successMessage = "Campaign lead deleted successfully";
					break;
				}
				default:
					toast.error("Unknown delete type");
					return;
			}

			// Check for various error response formats
			if (result?.data?.success) {
				toast.success(successMessage);
				setDeleteModal({ isOpen: false, type: "", id: "", title: "" });

				// Invalidate the coach query to refresh the data
				await queryClient.invalidateQueries({
					queryKey: coachQueries.detail(coachId),
				});
			} else if (result?.data?.error) {
				// Show specific error message from server
				toast.error(result.data.error);
			} else if (result?.serverError) {
				// Handle server errors
				toast.error("Server error occurred. Please try again.");
			} else if (result?.validationErrors) {
				// Handle validation errors
				toast.error("Validation error. Please check the data.");
			} else {
				// Unknown error format
				toast.error("Failed to delete. Please try again.");
			}
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "An unexpected error occurred while deleting",
			);
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !coach) return <div>Error loading coach</div>;

	const fullName = coach.full_name || "Unknown Coach";
	const initials = (coach.full_name || "UC")
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarFallback className="font-semibold text-lg">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="font-bold text-2xl">{fullName}</h1>
						<p className="text-muted-foreground text-sm">
							{coach.primary_specialty
								? coach.primary_specialty.charAt(0).toUpperCase() +
									coach.primary_specialty.slice(1)
								: "No specialty set"}
						</p>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				<CoachIdentityRole
					coach={{
						full_name: coach.full_name,
						primary_specialty: coach.primary_specialty,
						internal_notes: coach.internal_notes,
					}}
					isEditing={editState.isEditing && editState.section === "identity"}
					onEditToggle={() => handleEditToggle("identity")}
					onSave={(data) => {
						void handleSave(data);
					}}
					onCancel={handleCancel}
				/>
				<CoachContactSocial
					coach={{
						email: coach.email,
						phone: coach.phone,
						twitter_profile: coach.twitter_profile,
						linkedin_profile: coach.linkedin_profile,
						instagram_profile: coach.instagram_profile,
					}}
					isEditing={editState.isEditing && editState.section === "contact"}
					onEditToggle={() => handleEditToggle("contact")}
					onSave={(data) => {
						void handleSave(data);
					}}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="university_jobs" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="university_jobs">University Jobs</TabsTrigger>
					<TabsTrigger value="campaign_leads">Campaign Leads</TabsTrigger>
					<TabsTrigger value="ball_knowledge">Ball Knowledge</TabsTrigger>
				</TabsList>

				<TabsContent value="university_jobs">
					<CoachUniversityJobsSection
						coachId={coachId}
						universityJobs={coach.university_jobs || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="campaign_leads">
					<CoachCampaignLeadsSection
						coachId={coachId}
						campaignLeads={coach.campaign_leads || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="ball_knowledge">
					<BallKnowledgeSection
						entityType="coach"
						entityId={coachId}
						defaultAboutCoachId={coachId}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<CoachSystemInfo
				created_at={
					"created_at" in coach
						? (coach.created_at as string | null | undefined)
						: null
				}
				updated_at={
					"updated_at" in coach
						? (coach.updated_at as string | null | undefined)
						: null
				}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={deleteModal.isOpen}
				onOpenChange={(open) =>
					setDeleteModal({ ...deleteModal, isOpen: open })
				}
				onConfirm={handleDelete}
				title={deleteModal.title}
				description="This action cannot be undone. This will permanently delete the record."
			/>
		</div>
	);
}
