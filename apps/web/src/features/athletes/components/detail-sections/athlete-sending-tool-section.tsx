import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

interface AthleteSendingToolSectionProps {
	athleteId: string;
}

export function AthleteSendingToolSection({
	athleteId,
}: AthleteSendingToolSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Send className="h-5 w-5" />
					Sending Tool Lead Lists (CSV Exports)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<p className="text-sm">
						Sending tool lead lists will be loaded dynamically
					</p>
					<p className="text-xs">Athlete ID: {athleteId}</p>
				</div>
			</CardContent>
		</Card>
	);
}
