"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTeamMemberAction } from "../actions/updateTeamMember";
import { teamMemberQueries, useTeamMember } from "../queries/useTeamMembers";
import { TeamMemberAthletesSection } from "./detail-sections/team-member-athletes-section";
import { TeamMemberBasicInfo } from "./detail-sections/team-member-basic-info";
import { TeamMemberSystemInfo } from "./detail-sections/team-member-system-info";

interface TeamMemberDetailViewProps {
	teamMemberId: string;
}

export default function TeamMemberDetailView({
	teamMemberId,
}: TeamMemberDetailViewProps) {
	const { data: teamMember, isLoading, error } = useTeamMember(teamMemberId);
	const queryClient = useQueryClient();

	// Edit state for basic info section
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

	const handleSave = async (data: {
		name: string;
		job_title: string;
		timezone: string;
		internal_notes: string;
	}) => {
		try {
			// Only process if we're editing the basic section
			if (editState.section !== "basic") {
				return;
			}

			// Transform form data to match the updateTeamMemberAction format
			const updateData = {
				id: teamMemberId,
				name: data.name,
				job_title: data.job_title || "",
				timezone: data.timezone || "",
				internal_notes: data.internal_notes || "",
			};

			// Call the update action
			const result = await updateTeamMemberAction(updateData);

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
					toast.error("Failed to update team member");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Team member updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: teamMemberQueries.detail(teamMemberId),
				});
			} else {
				toast.error("Failed to update team member");
			}
		} catch (error) {
			console.error("Error updating team member:", error);
			toast.error("Failed to update team member");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !teamMember) return <div>Error loading team member</div>;

	const fullName =
		teamMember.first_name && teamMember.last_name
			? `${teamMember.first_name} ${teamMember.last_name}`.trim()
			: teamMember.first_name || teamMember.last_name || "Unknown";

	const initials =
		(teamMember.first_name?.[0] || "") + (teamMember.last_name?.[0] || "");

	// Combine athletes from both setter and closer relationships
	const allAthletes = [
		...(teamMember.athletes_as_setter || []),
		...(teamMember.athletes_as_closer || []),
	];

	// Remove duplicates (in case a team member is both setter and closer for same athlete)
	const uniqueAthletes = allAthletes.filter(
		(athlete, index, self) =>
			index === self.findIndex((a) => a.id === athlete.id),
	);

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
						{teamMember.job_title && (
							<p className="text-muted-foreground">{teamMember.job_title}</p>
						)}
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6">
				<TeamMemberBasicInfo
					teamMember={{
						name: fullName,
						job_title: teamMember.job_title,
						timezone: teamMember.timezone,
						internal_notes: teamMember.internal_notes,
					}}
					isEditing={editState.isEditing && editState.section === "basic"}
					onEditToggle={() => handleEditToggle("basic")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Athletes Tab */}
			<Tabs defaultValue="athletes" className="w-full">
				<TabsList className="grid w-full grid-cols-1">
					<TabsTrigger value="athletes">Athletes</TabsTrigger>
				</TabsList>

				<TabsContent value="athletes">
					<TeamMemberAthletesSection
						teamMemberId={teamMemberId}
						athletes={uniqueAthletes}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<TeamMemberSystemInfo teamMember={teamMember} />
		</div>
	);
}
