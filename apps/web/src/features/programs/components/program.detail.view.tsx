"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BallKnowledgeSection } from "@/features/ball-knowledge/components/ball-knowledge-section";
import { updateProgramAction } from "@/features/programs/actions/updateProgram";
import { useProgram } from "@/features/programs/queries/usePrograms";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ProgramAffiliationSection } from "./detail-sections/program-affiliation-section";
import { ProgramSystemInfo } from "./detail-sections/program-system-info";
import { ProgramTeamLinksSection } from "./detail-sections/program-team-links-section";
import { AssignedCoachesTab } from "./detail-tabs/assigned-coaches-tab";
import { ProgramEventsTab } from "./detail-tabs/program-events-tab";

interface ProgramDetailViewProps {
	programId: string;
}

export default function ProgramDetailView({
	programId,
}: ProgramDetailViewProps) {
	const { data: program, isLoading, error } = useProgram(programId);
	const queryClient = useQueryClient();

	// Edit state for basic info sections
	const [editState, setEditState] = useState<{
		isEditing: boolean;
		section: "affiliation" | "team_links" | null;
	}>({ isEditing: false, section: null });

	// Update program action
	const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
		updateProgramAction,
		{
			onSuccess: () => {
				toast.success("Program updated successfully");
				setEditState({ isEditing: false, section: null });
				queryClient.invalidateQueries({
					queryKey: ["programs", "detail", programId],
				});
			},
			onError: (err) => {
				console.error("Error updating program:", err);
				toast.error("Failed to update program. Please try again.");
			},
		},
	);

	const handleEditToggle = (section: "affiliation" | "team_links") => {
		if (editState.isEditing && editState.section === section) {
			// Cancel edit
			setEditState({ isEditing: false, section: null });
		} else {
			// Start edit
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (data: Record<string, unknown>) => {
		executeUpdate({
			id: programId,
			...data,
		});
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !program) return <div>Error loading program</div>;

	const programName = `${program.universities?.name || "Unknown University"} - ${program.gender ? `${program.gender.charAt(0).toUpperCase()}${program.gender.slice(1)}'s Program` : "Program"}`;
	const initials = (program.universities?.name || "U")
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
						<h1 className="font-bold text-2xl">{programName}</h1>
						<p className="text-muted-foreground text-sm">
							{program.universities?.city && program.universities?.state
								? `${program.universities.city}, ${program.universities.state}`
								: "Location not specified"}
						</p>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				<ProgramAffiliationSection
					program={program}
					isEditing={editState.isEditing && editState.section === "affiliation"}
					onEditToggle={() => handleEditToggle("affiliation")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<ProgramTeamLinksSection
					program={program}
					isEditing={editState.isEditing && editState.section === "team_links"}
					onEditToggle={() => handleEditToggle("team_links")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="events" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="events">
						Program Events ({program.program_events?.length || 0})
					</TabsTrigger>
					<TabsTrigger value="coaches">
						Assigned Coaches ({program.university_jobs?.length || 0})
					</TabsTrigger>
					<TabsTrigger value="ball_knowledge">Ball Knowledge</TabsTrigger>
				</TabsList>

				<TabsContent value="events" className="mt-4">
					<ProgramEventsTab
						events={program.program_events || []}
						programId={programId}
						onRefresh={() =>
							queryClient.invalidateQueries({
								queryKey: ["programs", "detail", programId],
							})
						}
					/>
				</TabsContent>

				<TabsContent value="coaches" className="mt-4">
					<AssignedCoachesTab
						jobs={program.university_jobs || []}
						programId={programId}
						universityId={program.university_id}
						onRefresh={() =>
							queryClient.invalidateQueries({
								queryKey: ["programs", "detail", programId],
							})
						}
					/>
				</TabsContent>

				<TabsContent value="ball_knowledge" className="mt-4">
					<BallKnowledgeSection
						entityType="program"
						entityId={programId}
						defaultAboutUniversityId={program?.university_id}
						defaultAboutProgramId={programId}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<ProgramSystemInfo program={program} />
		</div>
	);
}
