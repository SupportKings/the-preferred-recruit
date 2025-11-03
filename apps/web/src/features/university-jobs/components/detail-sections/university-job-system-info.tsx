import { formatTimestamp } from "@/lib/date-utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Clock } from "lucide-react";

interface UniversityJobSystemInfoProps {
	universityJob: {
		id: string;
		created_at: string | null;
		updated_at: string | null;
	};
}

export function UniversityJobSystemInfo({
	universityJob,
}: UniversityJobSystemInfoProps) {
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
					<p className="font-medium text-muted-foreground text-sm">Record ID</p>
					<p className="font-mono text-sm">{universityJob.id}</p>
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-sm">
						Created At
					</p>
					<p className="text-sm">{formatTimestamp(universityJob.created_at)}</p>
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-sm">
						Updated At
					</p>
					<p className="text-sm">{formatTimestamp(universityJob.updated_at)}</p>
				</div>
			</CardContent>
		</Card>
	);
}
