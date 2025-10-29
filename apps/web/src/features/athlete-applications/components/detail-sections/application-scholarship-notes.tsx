import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { DollarSign, Edit3, Save, X } from "lucide-react";

interface ApplicationScholarshipNotesProps {
	application: {
		scholarship_amount_per_year: number | null;
		scholarship_percent: number | null;
		offer_notes: string | null;
		internal_notes: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

export function ApplicationScholarshipNotes({
	application,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ApplicationScholarshipNotesProps) {
	const [formData, setFormData] = useState({
		scholarship_amount_per_year:
			application.scholarship_amount_per_year?.toString() || "",
		scholarship_percent: application.scholarship_percent?.toString() || "",
		offer_notes: application.offer_notes || "",
		internal_notes: application.internal_notes || "",
	});

	const handleSave = () => {
		// Convert string numbers to actual numbers
		onSave?.({
			scholarship_amount_per_year: formData.scholarship_amount_per_year
				? Number(formData.scholarship_amount_per_year)
				: null,
			scholarship_percent: formData.scholarship_percent
				? Number(formData.scholarship_percent)
				: null,
			offer_notes: formData.offer_notes || null,
			internal_notes: formData.internal_notes || null,
		});
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			scholarship_amount_per_year:
				application.scholarship_amount_per_year?.toString() || "",
			scholarship_percent: application.scholarship_percent?.toString() || "",
			offer_notes: application.offer_notes || "",
			internal_notes: application.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Scholarship & Notes
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
						Scholarship Amount per Year (USD)
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.scholarship_amount_per_year}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									scholarship_amount_per_year: e.target.value,
								}))
							}
							placeholder="Enter amount"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{application.scholarship_amount_per_year
								? `$${application.scholarship_amount_per_year.toLocaleString()}`
								: "Not set"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Scholarship Percentage (%)
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.scholarship_percent}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									scholarship_percent: e.target.value,
								}))
							}
							placeholder="Enter percentage"
							min="0"
							max="100"
							step="0.1"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{application.scholarship_percent
								? `${application.scholarship_percent}%`
								: "Not set"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Offer Notes
					</label>
					{isEditing ? (
						<Textarea
							value={formData.offer_notes}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									offer_notes: e.target.value,
								}))
							}
							placeholder="Notes about the offer (verbal, conditions, dates)"
							className="mt-1"
							rows={3}
						/>
					) : (
						<p className="whitespace-pre-wrap text-sm">
							{application.offer_notes || "Not provided"}
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
							placeholder="Private notes about this application"
							className="mt-1"
							rows={3}
						/>
					) : (
						<p className="whitespace-pre-wrap text-sm">
							{application.internal_notes || "Not provided"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
