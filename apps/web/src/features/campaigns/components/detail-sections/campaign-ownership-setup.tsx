import { useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

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
import { StatusBadge } from "@/components/ui/status-badge";

import { Edit3, Save, Users, X } from "lucide-react";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
	athlete?: {
		id: string;
		full_name: string;
		graduation_year: number | null;
	} | null;
	primary_lead_list?: {
		id: string;
		name: string | null;
		priority: number | null;
	} | null;
	seed_campaign?: {
		id: string;
		name: string | null;
		type: string | null;
	} | null;
};

interface CampaignOwnershipSetupProps {
	campaign: Campaign;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function CampaignOwnershipSetup({
	campaign,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: CampaignOwnershipSetupProps) {
	const [formData, setFormData] = useState({
		name: campaign.name || "",
		type: campaign.type || "",
		status: campaign.status || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		setFormData({
			name: campaign.name || "",
			type: campaign.type || "",
			status: campaign.status || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Ownership & Setup
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
						{campaign.athlete?.full_name || "No athlete assigned"}
						{campaign.athlete?.graduation_year &&
							` (Class of ${campaign.athlete.graduation_year})`}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Campaign Name
					</label>
					{isEditing ? (
						<Input
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{campaign.name || "Not set"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Campaign Type
					</label>
					{isEditing ? (
						<Select
							value={formData.type}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, type: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="top">Top</SelectItem>
								<SelectItem value="second_pass">Second Pass</SelectItem>
								<SelectItem value="third_pass">Third Pass</SelectItem>
								<SelectItem value="personal_best">Personal Best</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">{campaign.type || "Not set"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Status
					</label>
					{isEditing ? (
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, status: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="paused">Paused</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="exhausted">Exhausted</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							<StatusBadge>{campaign.status}</StatusBadge>
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Primary Lead List
					</label>
					<p className="text-sm">
						{campaign.primary_lead_list?.name || "No lead list"}
						{campaign.primary_lead_list?.priority &&
							` (Priority: ${campaign.primary_lead_list.priority})`}
					</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Seed Campaign
					</label>
					<p className="text-sm">
						{campaign.seed_campaign?.name || "None"}
						{campaign.seed_campaign?.type &&
							` (${campaign.seed_campaign.type})`}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
