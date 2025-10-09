import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

interface AthleteChecklistSectionProps {
	athleteId: string;
	checklists: any[];
}

export function AthleteChecklistSection({
	athleteId,
	checklists,
}: AthleteChecklistSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CheckSquare className="h-5 w-5" />
					Onboarding Checklist
				</CardTitle>
			</CardHeader>
			<CardContent>
				{checklists.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p className="text-sm">No checklist items yet</p>
					</div>
				) : (
					<div className="space-y-2">
						{checklists.map((checklist) => (
							<div key={checklist.id} className="rounded border p-3">
								<p className="text-sm">
									Checklist ID: {checklist.checklist_definition_id || "N/A"}
								</p>
								<p className="text-muted-foreground text-xs">
									Items: {checklist.checklist_items?.length || 0}
								</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
