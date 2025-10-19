import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ListChecks } from "lucide-react";
import { ManageResponsibilityModal } from "../manage-responsibility-modal";

interface NoResponsibilitiesProps {
	universityJobId: string;
}

export function NoResponsibilities({
	universityJobId,
}: NoResponsibilitiesProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<ListChecks className="h-5 w-5" />
						Responsibilities
					</CardTitle>
					<ManageResponsibilityModal
						universityJobId={universityJobId}
						mode="add"
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<ListChecks className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No responsibilities yet</p>
					<p className="mt-1 text-xs">
						Responsibilities will appear here once added to this position
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
