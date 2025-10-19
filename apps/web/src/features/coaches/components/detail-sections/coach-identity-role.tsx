import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { EVENT_GROUP_LABELS, EVENT_GROUPS } from "../../types/coach";

import { Edit3, Save, User, X } from "lucide-react";

interface CoachIdentityRoleFormData {
	full_name: string;
	primary_specialty: string;
	internal_notes: string;
}

interface CoachIdentityRoleProps {
	coach: {
		full_name: string | null;
		primary_specialty: string | null;
		internal_notes: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: CoachIdentityRoleFormData) => void;
	onCancel?: () => void;
}

export function CoachIdentityRole({
	coach,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: CoachIdentityRoleProps) {
	const [formData, setFormData] = useState({
		full_name: coach.full_name || "",
		primary_specialty: coach.primary_specialty || "",
		internal_notes: coach.internal_notes || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			full_name: coach.full_name || "",
			primary_specialty: coach.primary_specialty || "",
			internal_notes: coach.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Identity & Role
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
						htmlFor="full_name"
						className="font-medium text-muted-foreground text-sm"
					>
						Full Name
					</Label>
					{isEditing ? (
						<Input
							id="full_name"
							value={formData.full_name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, full_name: e.target.value }))
							}
							className="mt-1"
							placeholder="Enter full name"
						/>
					) : (
						<p className="text-sm">{coach.full_name || "Not provided"}</p>
					)}
				</div>
				<div>
					<Label
						htmlFor="primary_specialty"
						className="font-medium text-muted-foreground text-sm"
					>
						Primary Specialty
					</Label>
					{isEditing ? (
						<Select
							value={formData.primary_specialty}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, primary_specialty: value }))
							}
						>
							<SelectTrigger id="primary_specialty" className="mt-1">
								<SelectValue placeholder="Select specialty" />
							</SelectTrigger>
							<SelectContent>
								{EVENT_GROUPS.map((group) => (
									<SelectItem key={group} value={group}>
										{EVENT_GROUP_LABELS[group]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{coach.primary_specialty
								? EVENT_GROUP_LABELS[
										coach.primary_specialty as keyof typeof EVENT_GROUP_LABELS
									]
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<Label
						htmlFor="internal_notes"
						className="font-medium text-muted-foreground text-sm"
					>
						Internal Notes
					</Label>
					{isEditing ? (
						<Textarea
							id="internal_notes"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									internal_notes: e.target.value,
								}))
							}
							className="mt-1"
							placeholder="Enter internal notes"
							rows={4}
							maxLength={5000}
						/>
					) : (
						<p className="whitespace-pre-wrap text-sm">
							{coach.internal_notes || "No notes"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
