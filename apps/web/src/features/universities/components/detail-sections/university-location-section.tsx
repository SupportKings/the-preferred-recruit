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

import { Edit3, MapPin, Save, X } from "lucide-react";

interface UniversityLocationSectionProps {
	university: Tables<"universities">;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

export function UniversityLocationSection({
	university,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: UniversityLocationSectionProps) {
	const [formData, setFormData] = useState({
		city: university.city || "",
		state: university.state || "",
		region: university.region || "",
		size_of_city: university.size_of_city || "",
		conference_raw: university.conference_raw || "",
		division_raw: university.division_raw || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			city: university.city || "",
			state: university.state || "",
			region: university.region || "",
			size_of_city: university.size_of_city || "",
			conference_raw: university.conference_raw || "",
			division_raw: university.division_raw || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Location & Context
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
						City
					</label>
					{isEditing ? (
						<Input
							value={formData.city}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, city: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{university.city || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						State
					</label>
					{isEditing ? (
						<Input
							value={formData.state}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, state: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{university.state || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Region
					</label>
					{isEditing ? (
						<Input
							value={formData.region}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, region: e.target.value }))
							}
							placeholder="e.g., Midwest"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{university.region || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						City Size
					</label>
					{isEditing ? (
						<Select
							value={formData.size_of_city}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									size_of_city: value,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select size..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Small">Small ({"<"}50k)</SelectItem>
								<SelectItem value="Medium">Medium (50k-250k)</SelectItem>
								<SelectItem value="Large">Large (250k-1M)</SelectItem>
								<SelectItem value="Very Large">Very Large ({">"}1M)</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{university.size_of_city || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Conference (Raw)
					</label>
					{isEditing ? (
						<Input
							value={formData.conference_raw}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									conference_raw: e.target.value,
								}))
							}
							placeholder="Athletics conference"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.conference_raw || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Division (Raw)
					</label>
					{isEditing ? (
						<Input
							value={formData.division_raw}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									division_raw: e.target.value,
								}))
							}
							placeholder="NCAA/NAIA division"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{university.division_raw || "Not provided"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
