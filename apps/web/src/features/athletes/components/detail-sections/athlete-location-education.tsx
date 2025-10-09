import { useState } from "react";

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

interface AthleteLocationEducationProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function AthleteLocationEducation({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: AthleteLocationEducationProps) {
	const [formData, setFormData] = useState({
		high_school: athlete.high_school || "",
		city: athlete.city || "",
		state: athlete.state || "",
		country: athlete.country || "",
		graduation_year: athlete.graduation_year || "",
		year_entering_university: athlete.year_entering_university || "",
		student_type: athlete.student_type || "",
		sat_score: athlete.sat_score || "",
		act_score: athlete.act_score || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		setFormData({
			high_school: athlete.high_school || "",
			city: athlete.city || "",
			state: athlete.state || "",
			country: athlete.country || "",
			graduation_year: athlete.graduation_year || "",
			year_entering_university: athlete.year_entering_university || "",
			student_type: athlete.student_type || "",
			sat_score: athlete.sat_score || "",
			act_score: athlete.act_score || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Location & Education
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
						High School
					</label>
					{isEditing ? (
						<Input
							value={formData.high_school}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, high_school: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.high_school || "Not provided"}</p>
					)}
				</div>
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
						<p className="text-sm">{athlete.city || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						State/Province
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
						<p className="text-sm">{athlete.state || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Country
					</label>
					{isEditing ? (
						<Input
							value={formData.country}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, country: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.country || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						HS Graduation Year
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="2000"
							max="2050"
							value={formData.graduation_year}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									graduation_year: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.graduation_year || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Year Entering University
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="2000"
							max="2050"
							value={formData.year_entering_university}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									year_entering_university: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{athlete.year_entering_university || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Student Type
					</label>
					{isEditing ? (
						<Select
							value={formData.student_type}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, student_type: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="high_school">High School</SelectItem>
								<SelectItem value="transfer">Transfer</SelectItem>
								<SelectItem value="international">International</SelectItem>
								<SelectItem value="gap_year">Gap Year</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm capitalize">
							{athlete.student_type?.replace("_", " ") || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						SAT Score
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="400"
							max="1600"
							value={formData.sat_score}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, sat_score: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.sat_score || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						ACT Score
					</label>
					{isEditing ? (
						<Input
							type="number"
							min="1"
							max="36"
							value={formData.act_score}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, act_score: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{athlete.act_score || "Not provided"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
