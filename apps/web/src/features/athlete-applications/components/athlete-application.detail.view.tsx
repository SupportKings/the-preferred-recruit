"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { deleteCampaignLead } from "@/features/athlete-applications/actions/relations/campaign-leads";
import { deleteReply } from "@/features/athlete-applications/actions/relations/replies";
import { updateAthleteApplication } from "@/features/athlete-applications/actions/updateAthleteApplication";
import {
	applicationQueries,
	useApplication,
} from "@/features/athlete-applications/queries/useApplications";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ApplicationOriginAttribution } from "./detail-sections/application-origin-attribution";
import { ApplicationPartiesTarget } from "./detail-sections/application-parties-target";
import { ApplicationScholarshipNotes } from "./detail-sections/application-scholarship-notes";
import { ApplicationStageTiming } from "./detail-sections/application-stage-timing";
import { ApplicationSystemInfo } from "./detail-sections/application-system-info";
import { CampaignLeadsTab } from "./detail-tabs/campaign-leads-tab";
import { RepliesTab } from "./detail-tabs/replies-tab";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface AthleteApplicationDetailViewProps {
	applicationId: string;
	athletes?: Array<{
		id: string;
		full_name: string;
		graduation_year: number | null;
	}>;
	universities?: Array<{ id: string; name: string; city: string | null }>;
	programs?: Array<{ id: string; gender: string; university_id: string }>;
	leadLists?: Array<{ id: string; name: string; priority: string }>;
	campaigns?: Array<{ id: string; name: string; type: string; status: string }>;
	coaches?: Array<{
		id: string;
		full_name: string;
		university_jobs: Array<{
			id: string;
			job_title: string;
			work_email: string | null;
		}>;
	}>;
}

export default function AthleteApplicationDetailView({
	applicationId,
	athletes = [],
	universities = [],
	programs = [],
	leadLists = [],
	campaigns = [],
	coaches = [],
}: AthleteApplicationDetailViewProps) {
	const { data: application, isLoading, error } = useApplication(applicationId);
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
		section: "parties" | "stage" | "origin" | "scholarship" | null;
	}>({ isEditing: false, section: null });

	// Update application action
	const { execute: executeUpdate } = useAction(updateAthleteApplication, {
		onSuccess: () => {
			toast.success("Application updated successfully");
			setEditState({ isEditing: false, section: null });
			queryClient.invalidateQueries({
				queryKey: applicationQueries.detail(applicationId),
			});
		},
		onError: (err) => {
			console.error("Error updating application:", err);
			toast.error("Failed to update application. Please try again.");
		},
	});

	const handleEditToggle = (
		section: "parties" | "stage" | "origin" | "scholarship",
	) => {
		if (editState.isEditing && editState.section === section) {
			// Cancel edit
			setEditState({ isEditing: false, section: null });
		} else {
			// Start edit
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (data: Record<string, unknown>) => {
		// Convert empty strings to null
		const processedData: Record<string, unknown> = { ...data };
		Object.keys(processedData).forEach((key) => {
			if (processedData[key] === "") {
				processedData[key] = null;
			}
		});

		executeUpdate({
			id: applicationId,
			...processedData,
		});
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "reply":
					await deleteReply(deleteModal.id);
					toast.success("Reply deleted successfully");
					break;
				case "campaign_lead":
					await deleteCampaignLead(deleteModal.id);
					toast.success("Campaign lead deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the application query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: applicationQueries.detail(applicationId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !application) return <div>Error loading application</div>;

	const athleteName = application.athletes?.full_name || "Unknown Athlete";
	const universityName = application.universities?.name || "Unknown University";
	const fullName = `${athleteName} → ${universityName}`;
	const initials =
		`${athleteName.charAt(0)}${universityName.charAt(0)}`.toUpperCase();

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
							{application.programs?.gender
								? `${application.programs.gender.charAt(0).toUpperCase()}${application.programs.gender.slice(1)}'s Program`
								: "Program not specified"}
						</p>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				<ApplicationPartiesTarget
					application={application}
					athletes={athletes}
					universities={universities}
					programs={programs}
					isEditing={editState.isEditing && editState.section === "parties"}
					onEditToggle={() => handleEditToggle("parties")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<ApplicationStageTiming
					application={application}
					isEditing={editState.isEditing && editState.section === "stage"}
					onEditToggle={() => handleEditToggle("stage")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<ApplicationOriginAttribution
					application={application}
					leadLists={leadLists}
					campaigns={campaigns}
					isEditing={editState.isEditing && editState.section === "origin"}
					onEditToggle={() => handleEditToggle("origin")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<ApplicationScholarshipNotes
					application={application}
					isEditing={editState.isEditing && editState.section === "scholarship"}
					onEditToggle={() => handleEditToggle("scholarship")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="replies" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="replies">
						Replies ({application.replies?.length || 0})
					</TabsTrigger>
					<TabsTrigger value="campaign-leads">
						Campaign Leads ({application.campaign_leads?.length || 0})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="replies" className="mt-4">
					<RepliesTab
						applicationId={applicationId}
						replies={application.replies || []}
						campaigns={campaigns}
						coaches={coaches}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="campaign-leads" className="mt-4">
					<CampaignLeadsTab
						applicationId={applicationId}
						leads={application.campaign_leads || []}
						campaigns={campaigns}
						universities={universities}
						programs={programs}
						coaches={coaches}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<ApplicationSystemInfo application={application} />

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
