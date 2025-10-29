import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Building2, Edit3, Save, X } from "lucide-react";

interface ProgramAffiliationSectionProps {
	program: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function ProgramAffiliationSection({
	program,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ProgramAffiliationSectionProps) {
	const [formData, setFormData] = useState({
		gender: program.gender || "",
		internal_notes: program.internal_notes || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			gender: program.gender || "",
			internal_notes: program.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Affiliation
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
						University
					</label>
					<p className="text-sm">
						<Link
							href={`/dashboard/universities/${program.universities?.id}`}
							className="text-blue-600 hover:underline"
						>
							{program.universities?.name || "Unknown"}
						</Link>
						{program.universities?.city && (
							<span className="text-muted-foreground">
								{" "}
								- {program.universities.city}
							</span>
						)}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Program Gender
					</label>
					{isEditing ? (
						<Select
							value={formData.gender}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, gender: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="men">Men's</SelectItem>
								<SelectItem value="women">Women's</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm capitalize">{program.gender || "Not set"}</p>
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
							placeholder="Private notes about this program"
							className="mt-1"
							rows={3}
						/>
					) : (
						<p className="whitespace-pre-wrap text-sm">
							{program.internal_notes || "No notes"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
