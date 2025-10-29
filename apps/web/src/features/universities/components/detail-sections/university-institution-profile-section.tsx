import { useState } from "react";

import type { Tables } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Building2, Edit3, Save, X } from "lucide-react";

interface UniversityInstitutionProfileSectionProps {
	university: Tables<"universities">;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

export function UniversityInstitutionProfileSection({
	university,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: UniversityInstitutionProfileSectionProps) {
	const [formData, setFormData] = useState({
		name: university.name || "",
		type_public_private: university.type_public_private || "",
		religious_affiliation: university.religious_affiliation || "",
		institution_flags_raw: university.institution_flags_raw || "",
		ipeds_nces_id: university.ipeds_nces_id || "",
		internal_notes: university.internal_notes || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			name: university.name || "",
			type_public_private: university.type_public_private || "",
			religious_affiliation: university.religious_affiliation || "",
			institution_flags_raw: university.institution_flags_raw || "",
			ipeds_nces_id: university.ipeds_nces_id || "",
			internal_notes: university.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Institution Profile
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
						University Name
					</label>
					{isEditing ? (
						<Input
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{university.name || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Public/Private
					</label>
					{isEditing ? (
						<Select
							value={formData.type_public_private}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									type_public_private: value,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select type..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Public">Public</SelectItem>
								<SelectItem value="Private">Private</SelectItem>
								<SelectItem value="For-Profit">For-Profit</SelectItem>
								<SelectItem value="Non-Profit">Non-Profit</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{university.type_public_private || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Religious Affiliation
					</label>
					{isEditing ? (
						<Input
							value={formData.religious_affiliation}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									religious_affiliation: e.target.value,
								}))
							}
							placeholder="Denominational affiliation"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.religious_affiliation || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Institution Flags
					</label>
					{isEditing ? (
						<Input
							value={formData.institution_flags_raw}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									institution_flags_raw: e.target.value,
								}))
							}
							placeholder="Raw flags/labels"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.institution_flags_raw || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						IPEDS/NCES ID
					</label>
					{isEditing ? (
						<Input
							value={formData.ipeds_nces_id}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									ipeds_nces_id: e.target.value,
								}))
							}
							placeholder="Federal identifier"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.ipeds_nces_id || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Internal Notes
					</label>
					{isEditing ? (
						<Textarea
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									internal_notes: e.target.value,
								}))
							}
							placeholder="Private notes"
							className="mt-1"
							rows={3}
						/>
					) : (
						<p className="text-sm">{university.internal_notes || "No notes"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
