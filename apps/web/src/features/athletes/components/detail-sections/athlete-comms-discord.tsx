import { useState } from "react";

import { Edit3, MessageSquare, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UrlActions } from "@/components/url-actions";

interface AthleteCommsDiscordProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteCommsDiscord({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: AthleteCommsDiscordProps) {
	const [formData, setFormData] = useState({
		discord_channel_url: athlete.discord_channel_url || "",
		discord_channel_id: athlete.discord_channel_id || "",
		discord_username: athlete.discord_username || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			discord_channel_url: athlete.discord_channel_url || "",
			discord_channel_id: athlete.discord_channel_id || "",
			discord_username: athlete.discord_username || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Comms & Discord
					</div>
					{!isEditing ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={onEditToggle}
							className="h-8 w-8 p-0"
						>
							<Edit3 className="h-4 w-4" />
						</Button>
					) : (
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSave}
								className="h-8 w-8 p-0"
							>
								<Save className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCancel}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}
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
					{isEditing ? (
						<Input
							type="url"
							value={formData.discord_channel_url}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									discord_channel_url: e.target.value,
								}))
							}
							placeholder="https://discord.com/channels/..."
							className="mt-1"
						/>
					) : athlete.discord_channel_url ? (
						<UrlActions url={athlete.discord_channel_url} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Discord Channel ID
					</label>
					{isEditing ? (
						<Input
							value={formData.discord_channel_id}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									discord_channel_id: e.target.value,
								}))
							}
							placeholder="123456789012345678"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.discord_channel_id || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Discord Username
					</label>
					{isEditing ? (
						<Input
							value={formData.discord_username}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									discord_username: e.target.value,
								}))
							}
							placeholder="username#1234"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.discord_username || "Not provided"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
