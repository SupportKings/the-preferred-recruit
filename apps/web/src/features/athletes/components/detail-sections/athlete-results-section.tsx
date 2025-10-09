import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface AthleteResultsSectionProps {
	athleteId: string;
	results: any[];
}

export function AthleteResultsSection({
	athleteId,
	results,
}: AthleteResultsSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Trophy className="h-5 w-5" />
					Results
				</CardTitle>
			</CardHeader>
			<CardContent>
				{results.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p className="text-sm">No results yet</p>
					</div>
				) : (
					<div className="space-y-2">
						{results.map((result) => (
							<div key={result.id} className="rounded border p-3">
								<p className="font-medium text-sm">
									{result.event?.name || "Unknown Event"}
								</p>
								<p className="text-muted-foreground text-xs">
									Mark: {result.performance_mark || "N/A"} {result.event?.units || ""}
								</p>
								<p className="text-muted-foreground text-xs">
									{result.date_recorded
										? new Date(result.date_recorded).toLocaleDateString()
										: "No date"}
								</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
