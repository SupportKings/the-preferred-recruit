import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Edit3, Save, Users, X } from "lucide-react";

interface ApplicationPartiesTargetProps {
	application: {
		athlete_id: string;
		university_id: string;
		program_id: string;
		athletes?: {
			id: string;
			full_name: string;
			graduation_year: number | null;
		};
		universities?: {
			id: string;
			name: string;
			city: string | null;
		};
		programs?: {
			id: string;
			gender: string;
			team_url: string | null;
		};
	};
	athletes: Array<{
		id: string;
		full_name: string;
		graduation_year: number | null;
	}>;
	universities: Array<{ id: string; name: string; city: string | null }>;
	programs: Array<{ id: string; gender: string; university_id: string }>;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

export function ApplicationPartiesTarget({
	application,
	athletes = [],
	universities = [],
	programs = [],
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ApplicationPartiesTargetProps) {
	const [formData, setFormData] = useState({
		athlete_id: application.athlete_id || "",
		university_id: application.university_id || "",
		program_id: application.program_id || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			athlete_id: application.athlete_id || "",
			university_id: application.university_id || "",
			program_id: application.program_id || "",
		});
		onCancel?.();
	};

	// Filter programs based on selected university
	const filteredPrograms = formData.university_id
		? programs.filter((p) => p.university_id === formData.university_id)
		: programs;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Parties & Target
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
						Athlete
					</label>
					{isEditing ? (
						<Select
							value={formData.athlete_id}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, athlete_id: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{athletes.map((athlete) => (
									<SelectItem key={athlete.id} value={athlete.id}>
										{athlete.full_name}
										{athlete.graduation_year && ` (${athlete.graduation_year})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{application.athletes?.full_name || "Not set"}
							{application.athletes?.graduation_year &&
								` (Class of ${application.athletes.graduation_year})`}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						University
					</label>
					{isEditing ? (
						<Select
							value={formData.university_id}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									university_id: value,
									program_id: "", // Reset program when university changes
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{universities.map((university) => (
									<SelectItem key={university.id} value={university.id}>
										{university.name}
										{university.city && ` (${university.city})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{application.universities?.name || "Not set"}
							{application.universities?.city &&
								` (${application.universities.city})`}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Program
					</label>
					{isEditing ? (
						<Select
							value={formData.program_id}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, program_id: value }))
							}
							disabled={!formData.university_id}
						>
							<SelectTrigger className="mt-1">
								<SelectValue
									placeholder={
										formData.university_id
											? "Select program"
											: "Select university first"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{filteredPrograms.map((program) => (
									<SelectItem key={program.id} value={program.id}>
										{program.gender
											? `${program.gender.charAt(0).toUpperCase()}${program.gender.slice(1)}'s`
											: "Unknown"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<>
							<p className="text-sm">
								{application.programs?.gender
									? `${application.programs.gender.charAt(0).toUpperCase()}${application.programs.gender.slice(1)}'s`
									: "Not set"}
							</p>
							{application.programs?.team_url && (
								<a
									href={application.programs.team_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary text-xs hover:underline"
								>
									Team Page
								</a>
							)}
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
