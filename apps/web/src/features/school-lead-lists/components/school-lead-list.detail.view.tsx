"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Import relation delete actions
import { deleteSchoolLeadListEntry } from "../actions/relations/entries";
// Import update action
import { updateSchoolLeadListAction } from "../actions/updateSchoolLeadList";
// Import queries
import {
	schoolLeadListQueries,
	useSchoolLeadList,
} from "../queries/useSchoolLeadLists";
import { LeadListApplicationsSection } from "./detail-sections/lead-list-applications-section";
import { LeadListCampaignLeadsSection } from "./detail-sections/lead-list-campaign-leads-section";
import { LeadListCampaignsSection } from "./detail-sections/lead-list-campaigns-section";
import { LeadListEntriesSection } from "./detail-sections/lead-list-entries-section";
// Import section components
import { LeadListIdentity } from "./detail-sections/lead-list-identity";
import { LeadListSystemInfo } from "./detail-sections/lead-list-system-info";
import { LeadListTagging } from "./detail-sections/lead-list-tagging";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface SchoolLeadListDetailViewProps {
	leadListId: string;
}

export default function SchoolLeadListDetailView({
	leadListId,
}: SchoolLeadListDetailViewProps) {
	const { data: leadList, isLoading, error } = useSchoolLeadList(leadListId);
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
		section: "identity" | "tagging" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "identity" | "tagging") => {
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
			// Transform form data to match the updateSchoolLeadList format
			const updateData: any = {
				id: leadListId,
			};

			// Only include fields from the section being edited
			if (editState.section === "identity") {
				// Identity fields
				updateData.name = data.name;
				updateData.priority =
					data.priority === "" ? null : Number(data.priority);
			} else if (editState.section === "tagging") {
				// Tagging fields
				updateData.internal_notes = data.internal_notes || null;
				updateData.type = data.type || null;
			}

			// Call the update action
			const result = await updateSchoolLeadListAction(updateData);

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
					toast.error("Failed to update lead list");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Lead list updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: schoolLeadListQueries.detail(leadListId),
				});
			} else {
				toast.error("Failed to update lead list");
			}
		} catch (error) {
			console.error("Error updating lead list:", error);
			toast.error("Failed to update lead list");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "entry":
					await deleteSchoolLeadListEntry(deleteModal.id);
					toast.success("Entry deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the lead list query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: schoolLeadListQueries.detail(leadListId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !leadList) return <div>Error loading lead list</div>;

	const listName = leadList.name || "Unnamed List";
	const initials = listName
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
						<h1 className="font-bold text-2xl">{listName}</h1>
						{leadList.athlete && (
							<p className="text-muted-foreground text-sm">
								{leadList.athlete.full_name}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				<LeadListIdentity
					leadList={{
						name: leadList.name,
						priority: leadList.priority,
						athlete: leadList.athlete,
					}}
					isEditing={editState.isEditing && editState.section === "identity"}
					onEditToggle={() => handleEditToggle("identity")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<LeadListTagging
					leadList={{
						internal_notes: leadList.internal_notes,
						type: leadList.type,
					}}
					isEditing={editState.isEditing && editState.section === "tagging"}
					onEditToggle={() => handleEditToggle("tagging")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Child Level Info Sections */}
			<Tabs defaultValue="entries" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="entries">Entries</TabsTrigger>
					<TabsTrigger value="campaigns">Campaigns</TabsTrigger>
					<TabsTrigger value="campaign-leads">Campaign Leads</TabsTrigger>
					<TabsTrigger value="applications">Offers</TabsTrigger>
				</TabsList>

				<TabsContent value="entries">
					<LeadListEntriesSection
						leadListId={leadListId}
						entries={leadList.school_lead_list_entries}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="campaigns">
					<LeadListCampaignsSection
						campaigns={leadList.campaigns_primary_lead_list}
						leadListId={leadListId}
						athleteId={leadList.athlete_id || undefined}
					/>
				</TabsContent>

				<TabsContent value="campaign-leads">
					<LeadListCampaignLeadsSection
						campaignLeads={leadList.campaign_leads}
						leadListId={leadListId}
					/>
				</TabsContent>

				<TabsContent value="applications">
					<LeadListApplicationsSection
						applications={leadList.athlete_applications}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<LeadListSystemInfo leadList={leadList} />

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
