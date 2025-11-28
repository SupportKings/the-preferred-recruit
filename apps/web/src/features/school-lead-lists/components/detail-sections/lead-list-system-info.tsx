import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatLocalDate as format } from "@/lib/date-utils";
import { Clock } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(dateString, "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

interface LeadListSystemInfoProps {
	leadList: {
		created_at: string;
		updated_at: string;
	};
}

export function LeadListSystemInfo({ leadList }: LeadListSystemInfoProps) {
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
					<p className="text-sm">{formatDate(leadList.created_at)}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Updated
					</label>
					<p className="text-sm">{formatDate(leadList.updated_at)}</p>
				</div>
			</CardContent>
		</Card>
	);
}
