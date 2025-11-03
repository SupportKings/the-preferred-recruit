import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Target } from "lucide-react";
import { ManageCampaignLeadModal } from "../manage-campaign-lead-modal";

interface NoCampaignLeadsProps {
	applicationId: string;
	campaigns?: Array<{ id: string; name: string; type: string }>;
	programs?: Array<{ id: string; gender: string; university_id: string }>;
}

export function NoCampaignLeads({
	applicationId,
	campaigns,
	programs,
}: NoCampaignLeadsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Campaign Leads (Linked)
					</CardTitle>
					<ManageCampaignLeadModal
						applicationId={applicationId}
						mode="add"
						campaigns={campaigns}
						programs={programs}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No campaign leads yet</p>
					<p className="mt-1 text-xs">
						Campaign leads will appear here once linked to this application
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
