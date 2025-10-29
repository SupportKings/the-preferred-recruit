import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { BriefcaseIcon, Plus } from "lucide-react";
import { NoUniversityJobs } from "../empty-states/no-university-jobs";
import { ManageUniversityJobModal } from "../modals/manage-university-job-modal";
import { createUniversityJobsColumns } from "../table-columns/university-jobs-columns";

interface CoachUniversityJobsSectionProps {
	coachId: string;
	universityJobs: any[];
	setDeleteModal: (modal: {
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}) => void;
}

export function CoachUniversityJobsSection({
	coachId,
	universityJobs,
	setDeleteModal,
}: CoachUniversityJobsSectionProps) {
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const handleDelete = (job: any) => {
		setDeleteModal({
			isOpen: true,
			type: "university_job",
			id: job.id,
			title: `Delete ${job.job_title || "job"} at ${job.universities?.name || "Unknown University"}`,
		});
	};

	const jobColumns = createUniversityJobsColumns(handleDelete);

	const jobTable = useReactTable({
		data: universityJobs || [],
		columns: jobColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!universityJobs || universityJobs.length === 0) {
		return <NoUniversityJobs coachId={coachId} />;
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<BriefcaseIcon className="h-5 w-5" />
							University Jobs
						</CardTitle>
						<ManageUniversityJobModal
							coachId={coachId}
							open={createModalOpen}
							onOpenChange={setCreateModalOpen}
						>
							<Button size="sm" variant="outline">
								<Plus className="mr-2 h-4 w-4" />
								Add Job
							</Button>
						</ManageUniversityJobModal>
					</div>
				</CardHeader>
				<CardContent>
					<UniversalDataTable
						table={jobTable}
						emptyStateMessage="No university jobs found for this coach"
					/>
				</CardContent>
			</Card>
		</>
	);
}
