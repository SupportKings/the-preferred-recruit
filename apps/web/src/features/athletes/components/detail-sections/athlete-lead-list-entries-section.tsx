import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface AthleteLeadListEntriesSectionProps {
	athleteId: string;
}

export function AthleteLeadListEntriesSection({
	athleteId,
}: AthleteLeadListEntriesSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Database className="h-5 w-5" />
					Lead List Entries
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<p className="text-sm">
						Lead list entries will be loaded dynamically
					</p>
					<p className="text-xs">Athlete ID: {athleteId}</p>
				</div>
			</CardContent>
		</Card>
	);
}
