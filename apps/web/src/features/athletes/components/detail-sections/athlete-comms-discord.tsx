import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface AthleteCommsDiscordProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteCommsDiscord({ athlete }: AthleteCommsDiscordProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5" />
					Comms & Discord
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Assigned Sending Email
					</label>
					<p className="text-sm">
						{athlete.sending_email
							? `${athlete.sending_email.username}@${athlete.sending_email.domain?.domain_url || ""}`
							: "Not assigned"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Discord Channel URL
					</label>
					<p className="text-sm">
						{athlete.discord_channel_url || "Not provided"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Discord Channel ID
					</label>
					<p className="text-sm">{athlete.discord_channel_id || "Not provided"}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Discord Username
					</label>
					<p className="text-sm">{athlete.discord_username || "Not provided"}</p>
				</div>
			</CardContent>
		</Card>
	);
}
