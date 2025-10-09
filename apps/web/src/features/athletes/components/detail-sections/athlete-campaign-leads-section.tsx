import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2 } from "lucide-react";

interface AthleteCampaignLeadsSectionProps {
	athleteId: string;
}

export function AthleteCampaignLeadsSection({
	athleteId,
}: AthleteCampaignLeadsSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users2 className="h-5 w-5" />
					Campaign Leads
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<p className="text-sm">
						Campaign leads will be loaded dynamically
					</p>
					<p className="text-xs">Athlete ID: {athleteId}</p>
				</div>
			</CardContent>
		</Card>
	);
}
