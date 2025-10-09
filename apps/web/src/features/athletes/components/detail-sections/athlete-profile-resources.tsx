import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2 } from "lucide-react";

interface AthleteProfileResourcesProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteProfileResources({
	athlete,
}: AthleteProfileResourcesProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Link2 className="h-5 w-5" />
					Profile & Resources
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						AthleteNet URL
					</label>
					<p className="text-sm">
						{athlete.athlete_net_url ? (
							<a
								href={athlete.athlete_net_url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								{athlete.athlete_net_url}
							</a>
						) : (
							"Not provided"
						)}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						MileSplit URL
					</label>
					<p className="text-sm">
						{athlete.milesplit_url ? (
							<a
								href={athlete.milesplit_url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								{athlete.milesplit_url}
							</a>
						) : (
							"Not provided"
						)}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Google Drive Folder
					</label>
					<p className="text-sm">
						{athlete.google_drive_folder_url ? (
							<a
								href={athlete.google_drive_folder_url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								Open Folder
							</a>
						) : (
							"Not provided"
						)}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
