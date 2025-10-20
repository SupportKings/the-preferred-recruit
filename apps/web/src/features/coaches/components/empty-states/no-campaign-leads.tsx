import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, TargetIcon } from "lucide-react";
import { ManageCampaignLeadModal } from "../modals/manage-campaign-lead-modal";

interface NoCampaignLeadsProps {
	coachId: string;
}

export function NoCampaignLeads({ coachId }: NoCampaignLeadsProps) {
	const [createModalOpen, setCreateModalOpen] = useState(false);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<TargetIcon className="h-5 w-5" />
						Campaign Leads
					</CardTitle>
					<ManageCampaignLeadModal
						coachId={coachId}
						open={createModalOpen}
						onOpenChange={setCreateModalOpen}
					>
						<Button size="sm" variant="outline">
							<Plus className="mr-2 h-4 w-4" />
							Add Lead
						</Button>
					</ManageCampaignLeadModal>
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<TargetIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No campaign leads yet</p>
					<p className="mt-1 text-xs">
						Campaign leads will appear here once this coach is added to
						campaigns
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
