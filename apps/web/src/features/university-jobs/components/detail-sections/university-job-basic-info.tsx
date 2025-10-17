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

import { Edit3, Save, UserSquare2, X } from "lucide-react";

import { CoachLookup } from "@/features/athletes/components/lookups/coach-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";
import { UniversityLookup } from "@/features/athletes/components/lookups/university-lookup";

interface UniversityJobBasicInfoProps {
	universityJob: {
		coach_id: string | null;
		job_title: string | null;
		program_scope: string | null;
		university_id: string | null;
		program_id: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: unknown) => void;
	onCancel?: () => void;
}

export function UniversityJobBasicInfo({
	universityJob,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: UniversityJobBasicInfoProps) {
	const [formData, setFormData] = useState({
		coach_id: universityJob.coach_id,
		job_title: universityJob.job_title || "",
		program_scope: universityJob.program_scope || "n/a",
		university_id: universityJob.university_id,
		program_id: universityJob.program_id,
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			coach_id: universityJob.coach_id,
			job_title: universityJob.job_title || "",
			program_scope: universityJob.program_scope || "n/a",
			university_id: universityJob.university_id,
			program_id: universityJob.program_id,
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<UserSquare2 className="h-5 w-5" />
						Assignment & Role
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
						Coach
					</label>
					{isEditing ? (
						<CoachLookup
							value={formData.coach_id || ""}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, coach_id: value || null }))
							}
							label=""
						/>
					) : (
						<p className="text-sm">{universityJob.coach_id || "Not assigned"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Job Title
					</label>
					{isEditing ? (
						<Input
							value={formData.job_title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, job_title: e.target.value }))
							}
							className="mt-1"
							placeholder="e.g., Head Coach, Assistant Coach"
						/>
					) : (
						<p className="text-sm">{universityJob.job_title || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Program Scope
					</label>
					{isEditing ? (
						<Select
							value={formData.program_scope}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, program_scope: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="men">Men</SelectItem>
								<SelectItem value="women">Women</SelectItem>
								<SelectItem value="both">Both</SelectItem>
								<SelectItem value="n/a">N/A</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm capitalize">
							{universityJob.program_scope || "N/A"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						University
					</label>
					{isEditing ? (
						<UniversityLookup
							value={formData.university_id || ""}
							onChange={(value) =>
								setFormData((prev) => ({
									...prev,
									university_id: value || null,
								}))
							}
							label=""
						/>
					) : (
						<p className="text-sm">
							{universityJob.university_id || "Not assigned"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Program
					</label>
					{isEditing ? (
						<ProgramLookup
							universityId={formData.university_id || ""}
							value={formData.program_id || ""}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, program_id: value || null }))
							}
							label=""
							disabled={!formData.university_id}
						/>
					) : (
						<p className="text-sm">{universityJob.program_id || "Not assigned"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
