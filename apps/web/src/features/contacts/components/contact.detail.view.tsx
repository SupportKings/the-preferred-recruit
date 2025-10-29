"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteContactAthlete } from "../actions/relations/contactAthletes";
import { updateContactAction } from "../actions/updateContact";
import { contactQueries, useContact } from "../queries/useContacts";
import { ContactAthletesSection } from "./detail-sections/contact-athletes-section";
// Import detail section components
import { ContactBasicInfo } from "./detail-sections/contact-basic-info";
import { ContactSystemInfo } from "./detail-sections/contact-system-info";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface ContactDetailViewProps {
	contactId: string;
}

export default function ContactDetailView({
	contactId,
}: ContactDetailViewProps) {
	const { data: contact, isLoading, error } = useContact(contactId);
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
		section: "basic" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "basic") => {
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
			// Transform form data to match the updateContactSchema format
			const updateData: any = {
				id: contactId,
			};

			// Only include fields from the section being edited
			if (editState.section === "basic") {
				// Basic info fields
				updateData.full_name = data.full_name;
				updateData.email = data.email || null;
				updateData.phone = data.phone || null;
				updateData.preferred_contact_method =
					data.preferred_contact_method || null;
				updateData.internal_notes = data.internal_notes || null;
			}

			// Call the update action
			const result = await updateContactAction(updateData);

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
					toast.error("Failed to update contact");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Contact updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: contactQueries.detail(contactId),
				});
			} else {
				toast.error("Failed to update contact");
			}
		} catch (error) {
			console.error("Error updating contact:", error);
			toast.error("Failed to update contact");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "athlete":
					await deleteContactAthlete(deleteModal.id);
					toast.success("Athlete relationship deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the contact query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: contactQueries.detail(contactId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !contact) return <div>Error loading contact</div>;

	const fullName = contact.full_name || "Unknown Contact";
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
						{contact.email && (
							<p className="text-muted-foreground text-sm">{contact.email}</p>
						)}
						{contact.phone && (
							<p className="text-muted-foreground text-sm">{contact.phone}</p>
						)}
					</div>
				</div>
			</div>

			{/* Basic Information */}
			<div className="grid gap-6 md:grid-cols-2">
				<ContactBasicInfo
					contact={{
						full_name: contact.full_name || "",
						email: contact.email || "",
						phone: contact.phone || "",
						preferred_contact_method: contact.preferred_contact_method || "",
						internal_notes: contact.internal_notes || "",
					}}
					isEditing={editState.isEditing && editState.section === "basic"}
					onEditToggle={() => handleEditToggle("basic")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="athletes" className="w-full">
				<TabsList className="grid w-full grid-cols-1">
					<TabsTrigger value="athletes">Athlete Relationships</TabsTrigger>
				</TabsList>

				<TabsContent value="athletes">
					<ContactAthletesSection
						contactId={contactId}
						contactAthletes={contact.contact_athletes || []}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<ContactSystemInfo contact={contact} />

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
