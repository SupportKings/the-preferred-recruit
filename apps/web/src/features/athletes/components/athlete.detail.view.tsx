"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { deleteContactAthlete } from "@/features/contacts/actions/relations/contactAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAthleteApplication } from "../actions/athleteApplications";
import { deleteAthleteResult } from "../actions/athleteResults";
import { deleteCampaign } from "../actions/campaigns";
import { deleteChecklistItem } from "../actions/checklistItems";
import { deleteSchoolLeadList } from "../actions/schoolLeadLists";
import { updateAthleteAction } from "../actions/updateAthlete";
import { athleteQueries, useAthlete } from "../queries/useAthletes";
import { AthleteApplicationsSection } from "./detail-sections/athlete-applications-section";
import { AthleteCampaignsSection } from "./detail-sections/athlete-campaigns-section";
// Import tabs sections (to be created)
import { AthleteChecklistSection } from "./detail-sections/athlete-checklist-section";
import { AthleteCommsDiscord } from "./detail-sections/athlete-comms-discord";
import { AthleteContactsSection } from "./detail-sections/athlete-contacts-section";
import { AthleteContractBilling } from "./detail-sections/athlete-contract-billing";
// Import detail section components (to be created)
import { AthleteIdentityContact } from "./detail-sections/athlete-identity-contact";
import { AthleteLeadListsSection } from "./detail-sections/athlete-lead-lists-section";
import { AthleteLocationEducation } from "./detail-sections/athlete-location-education";
import { AthleteProfileResources } from "./detail-sections/athlete-profile-resources";
import { AthleteResultsSection } from "./detail-sections/athlete-results-section";
import { AthleteSalesEngagement } from "./detail-sections/athlete-sales-engagement";
import { AthleteSystemInfo } from "./detail-sections/athlete-system-info";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface AthleteDetailViewProps {
	athleteId: string;
}

export default function AthleteDetailView({
	athleteId,
}: AthleteDetailViewProps) {
	const { data: athlete, isLoading, error } = useAthlete(athleteId);
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
		section:
			| "identity"
			| "location"
			| "profile"
			| "comms"
			| "sales"
			| "contract"
			| null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (
		section:
			| "identity"
			| "location"
			| "profile"
			| "comms"
			| "sales"
			| "contract",
	) => {
		if (editState.isEditing && editState.section === section) {
			// Cancel edit
			setEditState({ isEditing: false, section: null });
		} else {
			// Start edit
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (data: any) => {
		try {
			// Transform form data to match the updateAthleteSchema format
			const updateData: any = {
				id: athleteId,
				...data,
			};

			// Call the update action
			const result = await updateAthleteAction(updateData);

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
					errorMessages.forEach((error) => toast.error(error));
				} else {
					toast.error("Failed to update athlete");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Athlete updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: athleteQueries.detail(athleteId),
				});
			} else {
				toast.error("Failed to update athlete");
			}
		} catch (error) {
			console.error("Error updating athlete:", error);
			toast.error("Failed to update athlete");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "contact":
					await deleteContactAthlete(deleteModal.id);
					toast.success("Contact deleted successfully");
					break;
				case "checklist":
					await deleteChecklistItem(deleteModal.id);
					toast.success("Checklist item deleted successfully");
					break;
				case "result":
					await deleteAthleteResult(deleteModal.id);
					toast.success("Result deleted successfully");
					break;
				case "application":
					await deleteAthleteApplication(deleteModal.id);
					toast.success("Application deleted successfully");
					break;
				case "leadList":
					await deleteSchoolLeadList(deleteModal.id);
					toast.success("Lead list deleted successfully");
					break;
				case "campaign":
					await deleteCampaign(deleteModal.id);
					toast.success("Campaign deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the athlete query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !athlete) return <div>Error loading athlete</div>;

	const fullName = athlete.full_name || "Unknown Athlete";
	const initials = fullName
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
						{athlete.contact_email && (
							<p className="text-muted-foreground text-sm">
								{athlete.contact_email}
							</p>
						)}
						{athlete.phone && (
							<p className="text-muted-foreground text-sm">{athlete.phone}</p>
						)}
					</div>
				</div>
			</div>

			{/* Basic Information Grid - 6 subsections in 2x3 grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<AthleteIdentityContact
					athlete={athlete}
					isEditing={editState.isEditing && editState.section === "identity"}
					onEditToggle={() => handleEditToggle("identity")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<AthleteLocationEducation
					athlete={athlete}
					isEditing={editState.isEditing && editState.section === "location"}
					onEditToggle={() => handleEditToggle("location")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<AthleteProfileResources
					athlete={athlete}
					isEditing={editState.isEditing && editState.section === "profile"}
					onEditToggle={() => handleEditToggle("profile")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<AthleteCommsDiscord
					athlete={athlete}
					isEditing={editState.isEditing && editState.section === "comms"}
					onEditToggle={() => handleEditToggle("comms")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<AthleteSalesEngagement
					athlete={athlete}
					isEditing={editState.isEditing && editState.section === "sales"}
					onEditToggle={() => handleEditToggle("sales")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<AthleteContractBilling
					athlete={athlete}
					isEditing={editState.isEditing && editState.section === "contract"}
					onEditToggle={() => handleEditToggle("contract")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="checklist" className="w-full">
				<TabsList className="grid w-full grid-cols-6">
					<TabsTrigger value="checklist">Checklist</TabsTrigger>
					<TabsTrigger value="contacts">Contacts</TabsTrigger>
					<TabsTrigger value="results">Results</TabsTrigger>
					<TabsTrigger value="lead-lists">School Lead Lists</TabsTrigger>
					<TabsTrigger value="campaigns">Campaigns</TabsTrigger>
					<TabsTrigger value="applications">Applications</TabsTrigger>
				</TabsList>

				<TabsContent value="checklist">
					<AthleteChecklistSection
						athleteId={athleteId}
						checklists={athlete.checklists || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="contacts">
					<AthleteContactsSection
						athleteId={athleteId}
						contactAthletes={athlete.contact_athletes || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="results">
					<AthleteResultsSection
						athleteId={athleteId}
						results={athlete.athlete_results || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="lead-lists">
					<AthleteLeadListsSection
						athleteId={athleteId}
						leadLists={athlete.school_lead_lists || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="campaigns">
					<AthleteCampaignsSection
						athleteId={athleteId}
						campaigns={athlete.campaigns || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="applications">
					<AthleteApplicationsSection
						athleteId={athleteId}
						applications={athlete.athlete_applications || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<AthleteSystemInfo athlete={athlete} />

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
