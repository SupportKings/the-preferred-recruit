import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Edit3, ListTree, Save, X } from "lucide-react";

interface LeadListIdentityProps {
	leadList: {
		name: string;
		priority: number | null;
		athlete: {
			full_name: string;
			contact_email: string;
			graduation_year: number | null;
		} | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function LeadListIdentity({
	leadList,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: LeadListIdentityProps) {
	const [formData, setFormData] = useState({
		name: leadList.name,
		priority: leadList.priority ?? "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			name: leadList.name,
			priority: leadList.priority ?? "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ListTree className="h-5 w-5" />
						List Identity
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
					<p className="text-sm">
						{leadList.athlete?.full_name || "Unknown Athlete"}
					</p>
					{leadList.athlete?.contact_email && (
						<p className="text-muted-foreground text-xs">
							{leadList.athlete.contact_email}
						</p>
					)}
					{leadList.athlete?.graduation_year && (
						<p className="text-muted-foreground text-xs">
							Class of {leadList.athlete.graduation_year}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						List Name
					</label>
					{isEditing ? (
						<Input
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							className="mt-1"
							placeholder="e.g., Fall 2025 D2 Targets"
						/>
					) : (
						<p className="text-sm">{leadList.name}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Priority
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.priority}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, priority: e.target.value }))
							}
							className="mt-1"
							placeholder="Enter priority (0-100)"
						/>
					) : (
						<p className="text-sm">{leadList.priority ?? "Not set"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
