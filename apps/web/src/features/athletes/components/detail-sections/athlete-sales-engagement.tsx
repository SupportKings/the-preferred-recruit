import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users } from "lucide-react";

interface AthleteSalesEngagementProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteSalesEngagement({
	athlete,
}: AthleteSalesEngagementProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Sales & Engagement
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Lead Source
					</label>
					<p className="text-sm">{athlete.lead_source || "Not provided"}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Setter
					</label>
					<p className="text-sm">
						{athlete.sales_setter
							? `${athlete.sales_setter.first_name} ${athlete.sales_setter.last_name} - ${athlete.sales_setter.job_title || ""}`
							: "Not assigned"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Closer
					</label>
					<p className="text-sm">
						{athlete.sales_closer
							? `${athlete.sales_closer.first_name} ${athlete.sales_closer.last_name} - ${athlete.sales_closer.job_title || ""}`
							: "Not assigned"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Sales Call
					</label>
					<p className="text-sm">
						{athlete.last_sales_call_at
							? new Date(athlete.last_sales_call_at).toLocaleString()
							: "No calls yet"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Call Note
					</label>
					<p className="text-sm">{athlete.sales_call_note || "No notes"}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sales Call Recording
					</label>
					<p className="text-sm">
						{athlete.sales_call_recording_url ? (
							<a
								href={athlete.sales_call_recording_url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								Listen to Recording
							</a>
						) : (
							"No recording"
						)}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
