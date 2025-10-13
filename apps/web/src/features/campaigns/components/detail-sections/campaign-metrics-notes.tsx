import { useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { BarChart3, Edit3, Save, X } from "lucide-react";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface CampaignMetricsNotesProps {
	campaign: Campaign;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function CampaignMetricsNotes({
	campaign,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: CampaignMetricsNotesProps) {
	const [formData, setFormData] = useState({
		leads_total: campaign.leads_total || 0,
		leads_loaded: campaign.leads_loaded || 0,
		leads_remaining: campaign.leads_remaining || 0,
		internal_notes: campaign.internal_notes || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		setFormData({
			leads_total: campaign.leads_total || 0,
			leads_loaded: campaign.leads_loaded || 0,
			leads_remaining: campaign.leads_remaining || 0,
			internal_notes: campaign.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Metrics & Notes
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
						Leads (Total)
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.leads_total}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									leads_total: Number.parseInt(e.target.value),
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{campaign.leads_total ?? "Not set"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Leads Loaded
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.leads_loaded}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									leads_loaded: Number.parseInt(e.target.value),
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{campaign.leads_loaded ?? "Not set"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Leads Remaining
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.leads_remaining}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									leads_remaining: Number.parseInt(e.target.value),
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{campaign.leads_remaining ?? "Not set"}</p>
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
							placeholder="Enter internal notes about this campaign..."
							className="mt-1"
							rows={4}
						/>
					) : (
						<p className="text-sm">{campaign.internal_notes || "No notes"}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
