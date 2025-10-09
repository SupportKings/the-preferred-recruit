import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

interface AthleteLeadListsSectionProps {
	athleteId: string;
	leadLists: any[];
}

export function AthleteLeadListsSection({
	athleteId,
	leadLists,
}: AthleteLeadListsSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<List className="h-5 w-5" />
					Lead Lists
				</CardTitle>
			</CardHeader>
			<CardContent>
				{leadLists.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p className="text-sm">No lead lists yet</p>
					</div>
				) : (
					<div className="space-y-2">
						{leadLists.map((list) => (
							<div key={list.id} className="rounded border p-3">
								<p className="font-medium text-sm">{list.name || "Unnamed List"}</p>
								<p className="text-muted-foreground text-xs">
									Priority: {list.priority || "N/A"} • Type: {list.type || "N/A"}
								</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
