"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { deleteCampaignLead } from "@/features/athletes/actions/campaignLeads";
import { useBallKnowledge } from "@/features/ball-knowledge/queries/useBallKnowledge";
import { updateUniversity } from "@/features/universities/actions/updateUniversity";
import { updateUniversityAthletics } from "@/features/universities/actions/updateUniversityAthletics";
import { useUniversity } from "@/features/universities/queries/useUniversities";

import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { UniversityAcademicsSection } from "./detail-sections/university-academics-section";
import { UniversityInstitutionProfileSection } from "./detail-sections/university-institution-profile-section";
import { UniversityLocationSection } from "./detail-sections/university-location-section";
import { UniversitySystemInfo } from "./detail-sections/university-system-info";
import { AthleteApplicationsTab } from "./detail-tabs/athlete-applications-tab";
import { BallKnowledgeTab } from "./detail-tabs/ball-knowledge-tab";
import { CampaignLeadsTab } from "./detail-tabs/campaign-leads-tab";
import { LeadListEntriesTab } from "./detail-tabs/lead-list-entries-tab";
import { ProgramsTab } from "./detail-tabs/programs-tab";
import { UniversityJobsTab } from "./detail-tabs/university-jobs-tab";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface UniversityDetailViewProps {
	universityId: string;
}

export default function UniversityDetailView({
	universityId,
}: UniversityDetailViewProps) {
	const { data: university, isLoading, error } = useUniversity(universityId);
	const { data: ballKnowledgeData } = useBallKnowledge({
		entityType: "university",
		entityId: universityId,
		page: 1,
		pageSize: 1, // We only need the count
	});
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
		section: "institution" | "location" | "academics" | null;
	}>({ isEditing: false, section: null });

	// Update university action
	const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
		updateUniversity,
		{
			onSuccess: () => {
				toast.success("University updated successfully");
				setEditState({ isEditing: false, section: null });
				queryClient.invalidateQueries({
					queryKey: ["universities", "detail", universityId],
				});
			},
			onError: (err) => {
				console.error("Error updating university:", err);
				toast.error("Failed to update university. Please try again.");
			},
		},
	);

	// Update university athletics action
	const { execute: executeAthleticsUpdate, isExecuting: isUpdatingAthletics } =
		useAction(updateUniversityAthletics, {
			onSuccess: () => {
				toast.success("Athletics information updated successfully");
				setEditState({ isEditing: false, section: null });
				queryClient.invalidateQueries({
					queryKey: ["universities", "detail", universityId],
				});
			},
			onError: (err) => {
				console.error("Error updating athletics:", err);
				toast.error(
					"Failed to update athletics information. Please try again.",
				);
			},
		});

	const handleEditToggle = (
		section: "institution" | "location" | "academics",
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
		// Extract conference and division IDs if present (for location section)
		const { conferenceId, divisionId, ...universityData } = data;

		// If conference or division changed, update athletics
		if (conferenceId !== undefined || divisionId !== undefined) {
			executeAthleticsUpdate({
				universityId,
				conferenceId: conferenceId as string | null,
				divisionId: divisionId as string | null,
			});
		}

		// Convert string numbers to actual numbers for numeric fields
		const processedData: Record<string, unknown> = { ...universityData };

		// Convert empty strings to null
		Object.keys(processedData).forEach((key) => {
			if (processedData[key] === "") {
				processedData[key] = null;
			}
		});

		// Convert string numbers to numbers for numeric fields
		const numericFields = [
			"average_gpa",
			"sat_ebrw_25th",
			"sat_ebrw_75th",
			"sat_math_25th",
			"sat_math_75th",
			"act_composite_25th",
			"act_composite_75th",
			"acceptance_rate_pct",
			"total_yearly_cost",
			"undergraduate_enrollment",
			"us_news_ranking_national_2018",
			"us_news_ranking_liberal_arts_2018",
		];

		numericFields.forEach((field) => {
			if (
				processedData[field] &&
				typeof processedData[field] === "string" &&
				processedData[field] !== ""
			) {
				const num = Number(processedData[field]);
				processedData[field] = Number.isNaN(num) ? null : num;
			}
		});

		// Only update university if there are non-athletics fields
		if (Object.keys(processedData).length > 0) {
			executeUpdate({
				id: universityId,
				...processedData,
			});
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
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the university query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: ["universities", "detail", universityId],
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !university) return <div>Error loading university</div>;

	const fullName = university.name || "Unknown University";
	const initials = (university.name || "U")
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	// Extract current conference and division
	const currentConference = (university.university_conferences as any)?.find(
		(uc: any) => uc.end_date === null,
	);
	const currentDivision = (university.university_divisions as any)?.find(
		(ud: any) => ud.end_date === null,
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
						<p className="text-muted-foreground text-sm">
							{university.city && university.state
								? `${university.city}, ${university.state}`
								: university.city ||
									university.state ||
									"Location not specified"}
						</p>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<UniversityInstitutionProfileSection
					university={university}
					isEditing={editState.isEditing && editState.section === "institution"}
					onEditToggle={() => handleEditToggle("institution")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<UniversityLocationSection
					university={university}
					currentConferenceId={currentConference?.conference_id}
					currentConferenceName={currentConference?.conferences?.name}
					currentDivisionId={currentDivision?.division_id}
					currentDivisionName={currentDivision?.divisions?.name}
					isEditing={editState.isEditing && editState.section === "location"}
					onEditToggle={() => handleEditToggle("location")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<UniversityAcademicsSection
					university={university}
					isEditing={editState.isEditing && editState.section === "academics"}
					onEditToggle={() => handleEditToggle("academics")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Relationship Tabs */}
			<Tabs defaultValue="programs" className="w-full">
				<TabsList className="grid w-full grid-cols-6">
					<TabsTrigger value="programs">Programs</TabsTrigger>
					<TabsTrigger value="jobs">University Jobs/Coaches</TabsTrigger>
					<TabsTrigger value="applications">Athlete Applications</TabsTrigger>
					<TabsTrigger value="leads">Lead List Entries</TabsTrigger>
					<TabsTrigger value="campaigns">Campaign Leads</TabsTrigger>
					<TabsTrigger value="knowledge">Ball Knowledge</TabsTrigger>
				</TabsList>

				<TabsContent value="programs" className="mt-4">
					<ProgramsTab
						programs={university.programs || []}
						universityId={universityId}
						onRefresh={() =>
							queryClient.invalidateQueries({
								queryKey: ["universities", "detail", universityId],
							})
						}
					/>
				</TabsContent>

				<TabsContent value="jobs" className="mt-4">
					<UniversityJobsTab
						jobs={university.university_jobs || []}
						universityId={universityId}
						onRefresh={() =>
							queryClient.invalidateQueries({
								queryKey: ["universities", "detail", universityId],
							})
						}
					/>
				</TabsContent>

				<TabsContent value="applications" className="mt-4">
					<AthleteApplicationsTab
						applications={university.athlete_applications || []}
						universityId={universityId}
						onRefresh={() =>
							queryClient.invalidateQueries({
								queryKey: ["universities", "detail", universityId],
							})
						}
					/>
				</TabsContent>

				<TabsContent value="leads" className="mt-4">
					<LeadListEntriesTab
						entries={university.school_lead_list_entries || []}
						universityId={universityId}
						onRefresh={() =>
							queryClient.invalidateQueries({
								queryKey: ["universities", "detail", universityId],
							})
						}
					/>
				</TabsContent>

				<TabsContent value="campaigns" className="mt-4">
					<CampaignLeadsTab
						leads={university.campaign_leads || []}
						universityId={universityId}
						setDeleteModal={setDeleteModal}
						onRefresh={() =>
							queryClient.invalidateQueries({
								queryKey: ["universities", "detail", universityId],
							})
						}
					/>
				</TabsContent>

				<TabsContent value="knowledge" className="mt-4">
					<BallKnowledgeTab universityId={universityId} />
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<UniversitySystemInfo university={university} />

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
