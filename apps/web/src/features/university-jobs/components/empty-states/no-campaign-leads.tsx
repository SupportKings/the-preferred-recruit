import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users } from "lucide-react";

import { ManageCampaignLeadModal } from "../manage-campaign-lead-modal";

interface NoCampaignLeadsProps {
	universityJobId: string;
}

export function NoCampaignLeads({ universityJobId }: NoCampaignLeadsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Campaign Leads
					</CardTitle>
					<ManageCampaignLeadModal universityJobId={universityJobId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No campaign leads yet</p>
					<p className="mt-1 text-xs">
						Campaign leads will appear here once added to this position
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
