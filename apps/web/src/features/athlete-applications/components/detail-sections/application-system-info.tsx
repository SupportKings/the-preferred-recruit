import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatTimestamp } from "@/lib/date-utils";
import { Clock } from "lucide-react";

interface ApplicationSystemInfoProps {
	application: {
		created_at: string;
		updated_at: string;
	};
}

export function ApplicationSystemInfo({
	application,
}: ApplicationSystemInfoProps) {
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
						Created At
					</label>
					<p className="text-sm">{formatTimestamp(application.created_at, "MMM dd, yyyy hh:mm a")}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Updated
					</label>
					<p className="text-sm">{formatTimestamp(application.updated_at, "MMM dd, yyyy hh:mm a")}</p>
				</div>
			</CardContent>
		</Card>
	);
}
