import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { format } from "date-fns";
import { Clock } from "lucide-react";

const formatDate = (dateString: string | null | undefined) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

interface CampaignSystemInfoProps {
	campaign: {
		id: string;
		deleted_at?: string | null;
	};
}

export function CampaignSystemInfo({ campaign }: CampaignSystemInfoProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					System Information
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Campaign ID
					</label>
					<p className="font-mono text-sm">{campaign.id}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Updated
					</label>
					<p className="text-sm">{formatDate(campaign.deleted_at)}</p>
				</div>
			</CardContent>
		</Card>
	);
}
