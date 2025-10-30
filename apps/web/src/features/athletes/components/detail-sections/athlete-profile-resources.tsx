import { useState } from "react";

import { Edit3, Link2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UrlActions } from "@/components/url-actions";

interface AthleteProfileResourcesProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteProfileResources({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: AthleteProfileResourcesProps) {
	const [formData, setFormData] = useState({
		athlete_net_url: athlete.athlete_net_url || "",
		milesplit_url: athlete.milesplit_url || "",
		google_drive_folder_url: athlete.google_drive_folder_url || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			athlete_net_url: athlete.athlete_net_url || "",
			milesplit_url: athlete.milesplit_url || "",
			google_drive_folder_url: athlete.google_drive_folder_url || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Link2 className="h-5 w-5" />
						Profile & Resources
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
						Athletic.net URL
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.athlete_net_url}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									athlete_net_url: e.target.value,
								}))
							}
							placeholder="https://www.athletic.net/..."
							className="mt-1"
						/>
					) : athlete.athlete_net_url ? (
						<UrlActions url={athlete.athlete_net_url} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						MileSplit URL
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.milesplit_url}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									milesplit_url: e.target.value,
								}))
							}
							placeholder="https://www.milesplit.com/..."
							className="mt-1"
						/>
					) : athlete.milesplit_url ? (
						<UrlActions url={athlete.milesplit_url} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Google Drive Folder
					</label>
					{isEditing ? (
						<Input
							type="url"
							value={formData.google_drive_folder_url}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									google_drive_folder_url: e.target.value,
								}))
							}
							placeholder="https://drive.google.com/..."
							className="mt-1"
						/>
					) : athlete.google_drive_folder_url ? (
						<UrlActions url={athlete.google_drive_folder_url} className="mt-1" />
					) : (
						<p className="mt-1 text-sm">Not provided</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
