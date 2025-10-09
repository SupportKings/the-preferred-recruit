import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { format } from "date-fns";
import { Clock } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

interface ContactSystemInfoProps {
	contact: {
		deleted_at: string | null;
	};
}

export function ContactSystemInfo({ contact }: ContactSystemInfoProps) {
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
						Deleted At
					</label>
					<p className="text-sm">{formatDate(contact.deleted_at)}</p>
				</div>
			</CardContent>
		</Card>
	);
}
