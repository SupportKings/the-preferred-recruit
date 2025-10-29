import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BriefcaseIcon, Plus } from "lucide-react";
import { ManageUniversityJobModal } from "../modals/manage-university-job-modal";

interface NoUniversityJobsProps {
	coachId: string;
}

export function NoUniversityJobs({ coachId }: NoUniversityJobsProps) {
	const [createModalOpen, setCreateModalOpen] = useState(false);

	return (
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
				<div className="py-8 text-center text-muted-foreground">
					<BriefcaseIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No university jobs yet</p>
					<p className="mt-1 text-xs">
						University job positions will appear here once added to this coach
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
