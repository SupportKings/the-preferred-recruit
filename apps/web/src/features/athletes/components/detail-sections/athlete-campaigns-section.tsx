import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface AthleteCampaignsSectionProps {
	athleteId: string;
	campaigns: any[];
}

export function AthleteCampaignsSection({
	athleteId,
	campaigns,
}: AthleteCampaignsSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Target className="h-5 w-5" />
					Campaigns
				</CardTitle>
			</CardHeader>
			<CardContent>
				{campaigns.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p className="text-sm">No campaigns yet</p>
					</div>
				) : (
					<div className="space-y-2">
						{campaigns.map((campaign) => (
							<div key={campaign.id} className="rounded border p-3">
								<p className="font-medium text-sm">
									{campaign.name || "Unnamed Campaign"}
								</p>
								<p className="text-muted-foreground text-xs">
									Type: {campaign.type || "N/A"} • Status: {campaign.status || "N/A"}
								</p>
								<p className="text-muted-foreground text-xs">
									Leads: {campaign.leads_total || 0} total, {campaign.leads_remaining || 0} remaining
								</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
