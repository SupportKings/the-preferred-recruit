"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { updateAthleteAction } from "../actions/updateAthlete";
import { athleteQueries, useAthlete } from "../queries/useAthletes";
import { deleteContactAthlete } from "@/features/contacts/actions/relations/contactAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Import detail section components (to be created)
import { AthleteIdentityContact } from "./detail-sections/athlete-identity-contact";
import { AthleteLocationEducation } from "./detail-sections/athlete-location-education";
import { AthleteProfileResources } from "./detail-sections/athlete-profile-resources";
import { AthleteCommsDiscord } from "./detail-sections/athlete-comms-discord";
import { AthleteSalesEngagement } from "./detail-sections/athlete-sales-engagement";
import { AthleteContractBilling } from "./detail-sections/athlete-contract-billing";
import { AthleteSystemInfo } from "./detail-sections/athlete-system-info";

// Import tabs sections (to be created)
import { AthleteChecklistSection } from "./detail-sections/athlete-checklist-section";
import { AthleteContactsSection } from "./detail-sections/athlete-contacts-section";
import { AthleteResultsSection } from "./detail-sections/athlete-results-section";
import { AthleteApplicationsSection } from "./detail-sections/athlete-applications-section";
import { AthleteLeadListsSection } from "./detail-sections/athlete-lead-lists-section";
import { AthleteCampaignsSection } from "./detail-sections/athlete-campaigns-section";
import { AthleteRepliesSection } from "./detail-sections/athlete-replies-section";
import { AthleteLeadListEntriesSection } from "./detail-sections/athlete-lead-list-entries-section";
import { AthleteCampaignLeadsSection } from "./detail-sections/athlete-campaign-leads-section";
import { AthleteSendingToolSection } from "./detail-sections/athlete-sending-tool-section";
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
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="checklist">Checklist</TabsTrigger>
					<TabsTrigger value="contacts">Contacts</TabsTrigger>
					<TabsTrigger value="results">Results</TabsTrigger>
					<TabsTrigger value="applications">Applications</TabsTrigger>
					<TabsTrigger value="lead-lists">Lead Lists</TabsTrigger>
				</TabsList>
				<TabsList className="grid w-full grid-cols-5 mt-2">
					<TabsTrigger value="campaigns">Campaigns</TabsTrigger>
					<TabsTrigger value="replies">Replies</TabsTrigger>
					<TabsTrigger value="entries">Entries</TabsTrigger>
					<TabsTrigger value="campaign-leads">Campaign Leads</TabsTrigger>
					<TabsTrigger value="sending-tool">Sending Tool</TabsTrigger>
				</TabsList>

				<TabsContent value="checklist">
					<AthleteChecklistSection
						athleteId={athleteId}
						checklists={athlete.checklists || []}
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
					/>
				</TabsContent>

				<TabsContent value="applications">
					<AthleteApplicationsSection
						athleteId={athleteId}
						applications={athlete.athlete_applications || []}
					/>
				</TabsContent>

				<TabsContent value="lead-lists">
					<AthleteLeadListsSection
						athleteId={athleteId}
						leadLists={athlete.school_lead_lists || []}
					/>
				</TabsContent>

				<TabsContent value="campaigns">
					<AthleteCampaignsSection
						athleteId={athleteId}
						campaigns={athlete.campaigns || []}
					/>
				</TabsContent>

				<TabsContent value="replies">
					<AthleteRepliesSection
						athleteId={athleteId}
						replies={athlete.replies || []}
					/>
				</TabsContent>

				<TabsContent value="entries">
					<AthleteLeadListEntriesSection athleteId={athleteId} />
				</TabsContent>

				<TabsContent value="campaign-leads">
					<AthleteCampaignLeadsSection athleteId={athleteId} />
				</TabsContent>

				<TabsContent value="sending-tool">
					<AthleteSendingToolSection athleteId={athleteId} />
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
