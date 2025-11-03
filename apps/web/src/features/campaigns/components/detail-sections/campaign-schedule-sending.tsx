import { useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { UrlActions } from "@/components/url-actions";

import { format } from "date-fns";
import { Calendar, Edit3, Save, X } from "lucide-react";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

interface CampaignScheduleSendingProps {
	campaign: Campaign;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function CampaignScheduleSending({
	campaign,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: CampaignScheduleSendingProps) {
	const [formData, setFormData] = useState({
		start_date: campaign.start_date || "",
		end_date: campaign.end_date || "",
		daily_send_cap: campaign.daily_send_cap || 0,
		sending_tool_campaign_url: campaign.sending_tool_campaign_url || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		setFormData({
			start_date: campaign.start_date || "",
			end_date: campaign.end_date || "",
			daily_send_cap: campaign.daily_send_cap || 0,
			sending_tool_campaign_url: campaign.sending_tool_campaign_url || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Schedule & Sending
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
						Start Date
					</label>
					{isEditing ? (
						<DatePicker
							value={
								formData.start_date
									? format(new Date(formData.start_date), "yyyy-MM-dd")
									: ""
							}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, start_date: value }))
							}
							placeholder="Select start date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{formatDate(campaign.start_date)}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						End Date
					</label>
					{isEditing ? (
						<DatePicker
							value={
								formData.end_date
									? format(new Date(formData.end_date), "yyyy-MM-dd")
									: ""
							}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, end_date: value }))
							}
							placeholder="Select end date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{formatDate(campaign.end_date)}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Daily Send Cap
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.daily_send_cap}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									daily_send_cap: Number.parseInt(e.target.value, 10),
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{campaign.daily_send_cap ?? "Not set"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Sending Tool Link
					</label>
					{isEditing ? (
						<Input
							value={formData.sending_tool_campaign_url}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									sending_tool_campaign_url: e.target.value,
								}))
							}
							placeholder="https://..."
							className="mt-1"
						/>
					) : campaign.sending_tool_campaign_url ? (
						<UrlActions
							url={campaign.sending_tool_campaign_url}
							className="mt-1"
						/>
					) : (
						<p className="mt-1 text-sm">Not set</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
