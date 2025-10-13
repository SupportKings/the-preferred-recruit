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

import { Edit3, GitBranch, Save, X } from "lucide-react";

interface ApplicationOriginAttributionProps {
	application: {
		origin_lead_list_id: string | null;
		origin_lead_list_priority: string | null;
		origin_campaign_id: string | null;
		origin_lead_lists?: {
			id: string;
			name: string;
			priority: string;
		} | null;
		origin_campaigns?: {
			id: string;
			name: string;
			type: string;
			status: string;
		} | null;
	};
	leadLists: Array<{ id: string; name: string; priority: string }>;
	campaigns: Array<{ id: string; name: string; type: string; status: string }>;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

export function ApplicationOriginAttribution({
	application,
	leadLists = [],
	campaigns = [],
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ApplicationOriginAttributionProps) {
	const [formData, setFormData] = useState<{
		origin_lead_list_id: string | null;
		origin_campaign_id: string | null;
	}>({
		origin_lead_list_id: application.origin_lead_list_id || null,
		origin_campaign_id: application.origin_campaign_id || null,
	});

	const handleSave = () => {
		// Add the priority from the selected lead list
		const selectedLeadList = leadLists.find(
			(ll) => ll.id === formData.origin_lead_list_id,
		);
		onSave?.({
			...formData,
			origin_lead_list_priority: selectedLeadList?.priority || null,
		});
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			origin_lead_list_id: application.origin_lead_list_id || "",
			origin_campaign_id: application.origin_campaign_id || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<GitBranch className="h-5 w-5" />
						Origin & Attribution
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
						Origin Lead List
					</label>
					{isEditing ? (
						<Select
							value={formData.origin_lead_list_id || "NONE"}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									origin_lead_list_id: value === "NONE" ? null : value,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="None" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="NONE">None</SelectItem>
								{leadLists.map((list) => (
									<SelectItem key={list.id} value={list.id}>
										{list.name} ({list.priority})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{application.origin_lead_lists
								? `${application.origin_lead_lists.name} (${application.origin_lead_lists.priority})`
								: "Not set"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Origin List Priority (Snapshot)
					</label>
					<p className="text-sm">
						{application.origin_lead_list_priority || "Not set"}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Origin Campaign
					</label>
					{isEditing ? (
						<Select
							value={formData.origin_campaign_id || "NONE"}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									origin_campaign_id: value === "NONE" ? null : value,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue placeholder="None" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="NONE">None</SelectItem>
								{campaigns.map((campaign) => (
									<SelectItem key={campaign.id} value={campaign.id}>
										{campaign.name} ({campaign.type} - {campaign.status})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{application.origin_campaigns
								? `${application.origin_campaigns.name} (${application.origin_campaigns.type} - ${application.origin_campaigns.status})`
								: "Not set"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
