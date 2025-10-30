import { useState } from "react";

import { Edit3, Link as LinkIcon, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UrlActions } from "@/components/url-actions";

interface ProgramTeamLinksSectionProps {
	program: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function ProgramTeamLinksSection({
	program,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ProgramTeamLinksSectionProps) {
	const [formData, setFormData] = useState({
		team_url: program.team_url || "",
		team_instagram: program.team_instagram || "",
		team_twitter: program.team_twitter || "",
	});

	const handleSave = () => {
		onSave?.({
			...formData,
			team_url: formData.team_url || null,
			team_instagram: formData.team_instagram || null,
			team_twitter: formData.team_twitter || null,
		});
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			team_url: program.team_url || "",
			team_instagram: program.team_instagram || "",
			team_twitter: program.team_twitter || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<LinkIcon className="h-5 w-5" />
						Team Links & Social
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
						Team Website
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.team_url}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, team_url: e.target.value }))
							}
							placeholder="https://..."
							className="mt-1"
						/>
					) : program.team_url ? (
						<UrlActions url={program.team_url} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Team Instagram
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.team_instagram}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									team_instagram: e.target.value,
								}))
							}
							placeholder="https://instagram.com/..."
							className="mt-1"
						/>
					) : program.team_instagram ? (
						<UrlActions url={program.team_instagram} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Team Twitter/X
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.team_twitter}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									team_twitter: e.target.value,
								}))
							}
							placeholder="https://twitter.com/..."
							className="mt-1"
						/>
					) : program.team_twitter ? (
						<UrlActions url={program.team_twitter} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
