import { useState } from "react";

import { formatLocalDate } from "@/lib/date-utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Edit3, Save, Settings, X } from "lucide-react";

interface UniversityJobOperationsProps {
	universityJob: {
		work_email: string | null;
		work_phone: string | null;
		start_date: string | null;
		end_date: string | null;
		internal_notes: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: unknown) => void;
	onCancel?: () => void;
}

export function UniversityJobOperations({
	universityJob,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: UniversityJobOperationsProps) {
	const [formData, setFormData] = useState({
		work_email: universityJob.work_email || "",
		work_phone: universityJob.work_phone || "",
		start_date: universityJob.start_date || "",
		end_date: universityJob.end_date || "",
		internal_notes: universityJob.internal_notes || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			work_email: universityJob.work_email || "",
			work_phone: universityJob.work_phone || "",
			start_date: universityJob.start_date || "",
			end_date: universityJob.end_date || "",
			internal_notes: universityJob.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Operations & Timeline
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
						Work Email
					</label>
					{isEditing ? (
						<Input
							type="email"
							value={formData.work_email}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, work_email: e.target.value }))
							}
							className="mt-1"
							placeholder="work@university.edu"
						/>
					) : (
						<p className="text-sm">
							{universityJob.work_email || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Work Phone
					</label>
					{isEditing ? (
						<Input
							type="tel"
							value={formData.work_phone}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, work_phone: e.target.value }))
							}
							className="mt-1"
							placeholder="(555) 123-4567"
						/>
					) : (
						<p className="text-sm">
							{universityJob.work_phone || "Not provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Start Date
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.start_date}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, start_date: value }))
							}
							placeholder="Select start date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{formatLocalDate(universityJob.start_date)}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						End Date
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.end_date}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, end_date: value }))
							}
							placeholder="Select end date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{formatLocalDate(universityJob.end_date)}</p>
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
							className="mt-1"
							placeholder="Internal notes about this position..."
							rows={3}
						/>
					) : (
						<p className="text-sm">
							{universityJob.internal_notes || "No notes"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
