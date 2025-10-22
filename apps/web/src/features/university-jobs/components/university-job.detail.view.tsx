"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCampaignLead } from "../actions/relations/campaignLeads";
import { deleteReply } from "../actions/relations/replies";
import { deleteCoachResponsibility } from "../actions/relations/responsibilities";
import { updateUniversityJobAction } from "../actions/updateUniversityJob";
import {
	universityJobQueries,
	useUniversityJob,
} from "../queries/useUniversityJobs";
import { UniversityJobBasicInfo } from "./detail-sections/university-job-basic-info";
import { UniversityJobCampaignLeadsSection } from "./detail-sections/university-job-campaign-leads-section";
import { UniversityJobOperations } from "./detail-sections/university-job-operations";
import { UniversityJobRepliesSection } from "./detail-sections/university-job-replies-section";
import { UniversityJobResponsibilitiesSection } from "./detail-sections/university-job-responsibilities-section";
import { UniversityJobSystemInfo } from "./detail-sections/university-job-system-info";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";
import { UniversityJobNotFound } from "./university-job-not-found";

interface UniversityJobDetailViewProps {
	universityJobId: string;
}

export default function UniversityJobDetailView({
	universityJobId,
}: UniversityJobDetailViewProps) {
	const {
		data: universityJob,
		isLoading,
		error,
	} = useUniversityJob(universityJobId);
	const queryClient = useQueryClient();

	// Delete modal state
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}>({ isOpen: false, type: "", id: "", title: "" });

	// Edit state for sections
	const [editState, setEditState] = useState<{
		isEditing: boolean;
		section: "basic" | "operations" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "basic" | "operations") => {
		if (editState.isEditing && editState.section === section) {
			setEditState({ isEditing: false, section: null });
		} else {
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (data: unknown) => {
		try {
			const updateData: {
				id: string;
				coach_id?: string | null;
				job_title?: string | null;
				program_scope?: "men" | "women" | "both" | "n/a" | null;
				university_id?: string | null;
				program_id?: string | null;
				work_email?: string | null;
				work_phone?: string | null;
				start_date?: string | null;
				end_date?: string | null;
				internal_notes?: string | null;
			} = {
				id: universityJobId,
			};

			if (editState.section === "basic") {
				const basicData = data as {
					coach_id: string | null;
					job_title: string;
					program_scope: string;
					university_id: string | null;
					program_id: string | null;
				};
				updateData.coach_id = basicData.coach_id;
				updateData.job_title = basicData.job_title;
				updateData.program_scope = basicData.program_scope as
					| "men"
					| "women"
					| "both"
					| "n/a"
					| null;
				updateData.university_id = basicData.university_id;
				updateData.program_id = basicData.program_id;
			} else if (editState.section === "operations") {
				const opsData = data as {
					work_email: string;
					work_phone: string;
					start_date: string;
					end_date: string;
					internal_notes: string;
				};
				updateData.work_email = opsData.work_email || null;
				updateData.work_phone = opsData.work_phone || null;
				updateData.start_date = opsData.start_date || null;
				updateData.end_date = opsData.end_date || null;
				updateData.internal_notes = opsData.internal_notes || null;
			}

			const result = await updateUniversityJobAction(updateData);

			if (result?.validationErrors) {
				const errorMessages: string[] = [];

				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}

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
					toast.error("Failed to update university job");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("University job updated successfully");
				setEditState({ isEditing: false, section: null });

				await queryClient.invalidateQueries({
					queryKey: universityJobQueries.detail(universityJobId),
				});
			} else {
				toast.error("Failed to update university job");
			}
		} catch (error) {
			console.error("Error updating university job:", error);
			toast.error("Failed to update university job");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "responsibility":
					await deleteCoachResponsibility(deleteModal.id);
					toast.success("Responsibility deleted successfully");
					break;
				case "campaign-lead":
					await deleteCampaignLead(deleteModal.id);
					toast.success("Campaign lead deleted successfully");
					break;
				case "reply":
					await deleteReply(deleteModal.id);
					toast.success("Reply deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			await queryClient.invalidateQueries({
				queryKey: universityJobQueries.detail(universityJobId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !universityJob) {
		return (
			<UniversityJobNotFound message="This university job could not be found. It may have been deleted or does not exist." />
		);
	}

	const getDisplayName = () => {
		const parts = [];
		if (universityJob.coaches?.full_name) {
			parts.push(universityJob.coaches.full_name);
		}
		if (universityJob.job_title) {
			parts.push(universityJob.job_title);
		}
		return parts.join(" - ") || "University Job";
	};

	const getInitials = () => {
		if (universityJob.coaches?.full_name) {
			return universityJob.coaches.full_name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		if (universityJob.job_title) {
			return universityJob.job_title
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		return "UJ";
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarFallback className="font-semibold text-lg">
							{getInitials()}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="font-bold text-2xl">{getDisplayName()}</h1>
						{universityJob.universities?.name && (
							<p className="text-muted-foreground">
								{universityJob.universities.name}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				<UniversityJobBasicInfo
					universityJob={{
						coach_id: universityJob.coach_id,
						job_title: universityJob.job_title,
						program_scope: universityJob.program_scope,
						university_id: universityJob.university_id,
						program_id: universityJob.program_id,
						coaches: universityJob.coaches
							? {
									id: universityJob.coaches.id,
									full_name: universityJob.coaches.full_name || "Unknown Coach",
									email: universityJob.coaches.email || undefined,
								}
							: null,
						universities: universityJob.universities
							? {
									id: universityJob.universities.id,
									name: universityJob.universities.name || "Unknown University",
									city: universityJob.universities.city || undefined,
									state: universityJob.universities.state || undefined,
								}
							: null,
						programs: universityJob.programs
							? {
									id: universityJob.programs.id,
									gender: universityJob.programs.gender || "Unknown",
								}
							: null,
					}}
					isEditing={editState.isEditing && editState.section === "basic"}
					onEditToggle={() => handleEditToggle("basic")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<UniversityJobOperations
					universityJob={{
						work_email: universityJob.work_email,
						work_phone: universityJob.work_phone,
						start_date: universityJob.start_date,
						end_date: universityJob.end_date,
						internal_notes: universityJob.internal_notes,
					}}
					isEditing={editState.isEditing && editState.section === "operations"}
					onEditToggle={() => handleEditToggle("operations")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="responsibilities" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
					<TabsTrigger value="campaign-leads">Campaign Leads</TabsTrigger>
					<TabsTrigger value="replies">Replies</TabsTrigger>
				</TabsList>

				<TabsContent value="responsibilities">
					<UniversityJobResponsibilitiesSection
						universityJobId={universityJobId}
						responsibilities={universityJob.coach_responsibilities}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="campaign-leads">
					<UniversityJobCampaignLeadsSection
						universityJobId={universityJobId}
						campaignLeads={universityJob.campaign_leads}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="replies">
					<UniversityJobRepliesSection
						universityJobId={universityJobId}
						replies={universityJob.replies}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<UniversityJobSystemInfo universityJob={universityJob} />

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
