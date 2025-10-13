"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DeleteConfirmModal } from "@/features/athlete-applications/components/shared/delete-confirm-modal";
import { deleteCampaignLead } from "@/features/athletes/actions/campaignLeads";
import { deleteReply } from "@/features/athletes/actions/replies";
import { deleteSendingToolLeadList } from "@/features/athletes/actions/sendingToolLeadLists";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateCampaignAction } from "../actions/updateCampaign";
import { campaignQueries, useCampaign } from "../queries/useCampaigns";
import { CampaignMetricsNotes } from "./detail-sections/campaign-metrics-notes";
import { CampaignOwnershipSetup } from "./detail-sections/campaign-ownership-setup";
import { CampaignScheduleSending } from "./detail-sections/campaign-schedule-sending";
import { CampaignSystemInfo } from "./detail-sections/campaign-system-info";
import { CampaignLeadsTab } from "./detail-tabs/campaign-leads-tab";
import { DerivedCampaignsTab } from "./detail-tabs/derived-campaigns-tab";
import { RepliesTab } from "./detail-tabs/replies-tab";
import { SendingToolFilesTab } from "./detail-tabs/sending-tool-files-tab";

interface CampaignDetailViewProps {
	campaignId: string;
}

export default function CampaignDetailView({
	campaignId,
}: CampaignDetailViewProps) {
	const { data: campaign, isLoading, error } = useCampaign(campaignId);
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
		section: "ownership" | "schedule" | "metrics" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "ownership" | "schedule" | "metrics") => {
		if (editState.isEditing && editState.section === section) {
			// Cancel edit
			setEditState({ isEditing: false, section: null });
		} else {
			// Start edit
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (data: Record<string, unknown>) => {
		try {
			// Transform form data to match the updateCampaignAction format
			const updateData: { id: string } & Record<string, unknown> = {
				id: campaignId,
			};

			// Only include fields from the section being edited
			if (editState.section === "ownership") {
				updateData.name = data.name;
				updateData.type = data.type;
				updateData.status = data.status;
			} else if (editState.section === "schedule") {
				updateData.start_date = data.start_date || null;
				updateData.end_date = data.end_date || null;
				updateData.daily_send_cap = data.daily_send_cap || null;
				updateData.sending_tool_campaign_url =
					data.sending_tool_campaign_url || null;
			} else if (editState.section === "metrics") {
				updateData.leads_total = data.leads_total || null;
				updateData.leads_loaded = data.leads_loaded || null;
				updateData.leads_remaining = data.leads_remaining || null;
				updateData.internal_notes = data.internal_notes || null;
			}

			// Call the update action
			const result = await updateCampaignAction(updateData);

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
					toast.error("Failed to update campaign");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Campaign updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: campaignQueries.detail(campaignId),
				});
			} else {
				toast.error("Failed to update campaign");
			}
		} catch (error) {
			console.error("Error updating campaign:", error);
			toast.error("Failed to update campaign");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "campaign_lead":
					await deleteCampaignLead(deleteModal.id);
					toast.success("Campaign lead deleted successfully");
					break;
				case "sending_tool_lead_list":
					await deleteSendingToolLeadList(deleteModal.id);
					toast.success("Sending tool file deleted successfully");
					break;
				case "reply":
					await deleteReply(deleteModal.id);
					toast.success("Reply deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the campaign query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: campaignQueries.detail(campaignId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !campaign) return <div>Error loading campaign</div>;

	const fullName = campaign.name || "Unnamed Campaign";
	const initials = (campaign.name || "UC")
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
						{campaign.athlete && (
							<p className="text-muted-foreground text-sm">
								{campaign.athlete.full_name}
								{campaign.athlete.graduation_year &&
									` • Class of ${campaign.athlete.graduation_year}`}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-3">
				<CampaignOwnershipSetup
					campaign={campaign}
					isEditing={editState.isEditing && editState.section === "ownership"}
					onEditToggle={() => handleEditToggle("ownership")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<CampaignScheduleSending
					campaign={campaign}
					isEditing={editState.isEditing && editState.section === "schedule"}
					onEditToggle={() => handleEditToggle("schedule")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<CampaignMetricsNotes
					campaign={campaign}
					isEditing={editState.isEditing && editState.section === "metrics"}
					onEditToggle={() => handleEditToggle("metrics")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="leads" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="leads">Campaign Leads</TabsTrigger>
					<TabsTrigger value="files">Sending Tool Files</TabsTrigger>
					<TabsTrigger value="replies">Replies</TabsTrigger>
					<TabsTrigger value="derived">Derived Campaigns</TabsTrigger>
				</TabsList>

				<TabsContent value="leads">
					<CampaignLeadsTab
						campaignId={campaignId}
						campaignLeads={campaign.campaign_leads || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="files">
					<SendingToolFilesTab
						campaignId={campaignId}
						sendingToolLeadLists={campaign.sending_tool_lead_lists || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="replies">
					<RepliesTab
						campaignId={campaignId}
						replies={campaign.replies || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="derived">
					<DerivedCampaignsTab
						derivedCampaigns={campaign.derived_campaigns || []}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<CampaignSystemInfo campaign={campaign} />

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
