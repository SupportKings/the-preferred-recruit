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
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";

import { Edit3, Save, Tag, X } from "lucide-react";

// Helper function to format lead list type for display
const formatLeadListType = (type?: string): string => {
	if (!type) return "";
	const typeMap: Record<string, string> = {
		d1: "Division I",
		d2: "Division II",
		d3: "Division III",
		naia: "NAIA",
		juco: "Junior College",
		reach: "Reach Schools",
		target: "Target Schools",
		safety: "Safety Schools",
	};
	return typeMap[type] || type;
};

interface LeadListTaggingProps {
	leadList: {
		internal_notes: string | null;
		type: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function LeadListTagging({
	leadList,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: LeadListTaggingProps) {
	const [formData, setFormData] = useState({
		internal_notes: leadList.internal_notes || "",
		type: leadList.type || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			internal_notes: leadList.internal_notes || "",
			type: leadList.type || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Tag className="h-5 w-5" />
						Tagging & Notes
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
						List Type
					</label>
					{isEditing ? (
						<Select
							value={formData.type}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, type: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="Select type..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="d1">Division I</SelectItem>
								<SelectItem value="d2">Division II</SelectItem>
								<SelectItem value="d3">Division III</SelectItem>
								<SelectItem value="naia">NAIA</SelectItem>
								<SelectItem value="juco">Junior College</SelectItem>
								<SelectItem value="reach">Reach Schools</SelectItem>
								<SelectItem value="target">Target Schools</SelectItem>
								<SelectItem value="safety">Safety Schools</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{leadList.type ? (
								<StatusBadge>{formatLeadListType(leadList.type)}</StatusBadge>
							) : (
								"Not specified"
							)}
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
							className="mt-1"
							placeholder="Private notes about this lead list..."
							rows={3}
						/>
					) : (
						<p className="text-sm">
							{leadList.internal_notes || "No notes provided"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
