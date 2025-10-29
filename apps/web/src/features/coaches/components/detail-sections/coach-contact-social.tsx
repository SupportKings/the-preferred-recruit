import { useState } from "react";

import { Edit3, Instagram, Linkedin, Mail, Phone, Save, Twitter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UrlActions } from "@/components/url-actions";

interface CoachContactSocialFormData {
	email: string;
	phone: string;
	twitter_profile: string;
	linkedin_profile: string;
	instagram_profile: string;
}

interface CoachContactSocialProps {
	coach: {
		email: string | null;
		phone: string | null;
		twitter_profile: string | null;
		linkedin_profile: string | null;
		instagram_profile: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: CoachContactSocialFormData) => void;
	onCancel?: () => void;
}

export function CoachContactSocial({
	coach,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: CoachContactSocialProps) {
	const [formData, setFormData] = useState({
		email: coach.email || "",
		phone: coach.phone || "",
		twitter_profile: coach.twitter_profile || "",
		linkedin_profile: coach.linkedin_profile || "",
		instagram_profile: coach.instagram_profile || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			email: coach.email || "",
			phone: coach.phone || "",
			twitter_profile: coach.twitter_profile || "",
			linkedin_profile: coach.linkedin_profile || "",
			instagram_profile: coach.instagram_profile || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Contact & Social
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
					<Label
						htmlFor="email"
						className="font-medium text-muted-foreground text-sm"
					>
						Email
					</Label>
					{isEditing ? (
						<Input
							id="email"
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, email: e.target.value }))
							}
							className="mt-1"
							placeholder="Enter email address"
						/>
					) : (
						<p className="text-sm">{coach.email || "Not provided"}</p>
					)}
				</div>
				<div>
					<Label
						htmlFor="phone"
						className="font-medium text-muted-foreground text-sm"
					>
						Phone
					</Label>
					{isEditing ? (
						<Input
							id="phone"
							type="tel"
							value={formData.phone}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, phone: e.target.value }))
							}
							className="mt-1"
							placeholder="Enter phone number"
						/>
					) : (
						<p className="text-sm">{coach.phone || "Not provided"}</p>
					)}
				</div>
				<div>
					<Label
						htmlFor="twitter_profile"
						className="font-medium text-muted-foreground text-sm"
					>
						Twitter Profile
					</Label>
					{isEditing ? (
						<div className="relative mt-1">
							<Twitter className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="twitter_profile"
								value={formData.twitter_profile}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										twitter_profile: e.target.value,
									}))
								}
								className="pl-10"
								placeholder="Enter Twitter URL or handle"
							/>
						</div>
					) : coach.twitter_profile ? (
						<UrlActions
							url={
								coach.twitter_profile.startsWith("http")
									? coach.twitter_profile
									: `https://twitter.com/${coach.twitter_profile}`
							}
							className="mt-1"
						/>
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
				<div>
					<Label
						htmlFor="linkedin_profile"
						className="font-medium text-muted-foreground text-sm"
					>
						LinkedIn Profile
					</Label>
					{isEditing ? (
						<div className="relative mt-1">
							<Linkedin className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="linkedin_profile"
								value={formData.linkedin_profile}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										linkedin_profile: e.target.value,
									}))
								}
								className="pl-10"
								placeholder="Enter LinkedIn URL"
							/>
						</div>
					) : coach.linkedin_profile ? (
						<UrlActions url={coach.linkedin_profile} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
				<div>
					<Label
						htmlFor="instagram_profile"
						className="font-medium text-muted-foreground text-sm"
					>
						Instagram Profile
					</Label>
					{isEditing ? (
						<div className="relative mt-1">
							<Instagram className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="instagram_profile"
								value={formData.instagram_profile}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										instagram_profile: e.target.value,
									}))
								}
								className="pl-10"
								placeholder="Enter Instagram URL or handle"
							/>
						</div>
					) : coach.instagram_profile ? (
						<UrlActions
							url={
								coach.instagram_profile.startsWith("http")
									? coach.instagram_profile
									: `https://instagram.com/${coach.instagram_profile}`
							}
							className="mt-1"
						/>
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
