"use client";

import { useState } from "react";

import { Constants } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	StatusBadge,
	type StatusColorScheme,
} from "@/components/ui/status-badge";

import { format } from "date-fns";
import { Calendar, Edit3, Save, X } from "lucide-react";

interface ApplicationStageTimingProps {
	application: {
		stage: string;
		start_date: string | null;
		offer_date: string | null;
		commitment_date: string | null;
		last_interaction_at: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: Record<string, unknown>) => void;
	onCancel?: () => void;
}

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatDateForInput = (dateString: string | null) => {
	if (!dateString) return "";
	try {
		return format(new Date(dateString), "yyyy-MM-dd");
	} catch {
		return "";
	}
};

// Get stage options from database constants
const stageOptions = Constants.public.Enums.application_stage_enum.map(
	(stage) => ({
		value: stage,
		label: stage.charAt(0).toUpperCase() + stage.slice(1),
	}),
);

// Map application stages to appropriate colors
const getStageColor = (stage: string): StatusColorScheme => {
	const stageMap: Record<string, StatusColorScheme> = {
		intro: "blue", // New/starting - info state
		ongoing: "yellow", // In progress - warning/pending state
		visit: "purple", // Special/important stage
		offer: "orange", // Awaiting decision
		committed: "green", // Success/completed
		dropped: "red", // Failed/ended
	};
	return stageMap[stage] || "gray";
};

export function ApplicationStageTiming({
	application,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ApplicationStageTimingProps) {
	const [formData, setFormData] = useState({
		stage: application.stage || "intro",
		start_date: formatDateForInput(application.start_date),
		offer_date: formatDateForInput(application.offer_date),
		commitment_date: formatDateForInput(application.commitment_date),
		last_interaction_at: formatDateForInput(application.last_interaction_at),
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			stage: application.stage || "intro",
			start_date: formatDateForInput(application.start_date),
			offer_date: formatDateForInput(application.offer_date),
			commitment_date: formatDateForInput(application.commitment_date),
			last_interaction_at: formatDateForInput(application.last_interaction_at),
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Stage & Timing
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
						Stage
					</label>
					{isEditing ? (
						<Select
							value={formData.stage}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, stage: value }))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{stageOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							<StatusBadge colorScheme={getStageColor(application.stage)}>
								{application.stage
									? application.stage.charAt(0).toUpperCase() +
										application.stage.slice(1)
									: "Unknown"}
							</StatusBadge>
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
						<p className="text-sm">{formatDate(application.start_date)}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Offer Date
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.offer_date}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, offer_date: value }))
							}
							placeholder="Select offer date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{formatDate(application.offer_date)}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Commitment Date
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.commitment_date}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, commitment_date: value }))
							}
							placeholder="Select commitment date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{formatDate(application.commitment_date)}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Interaction
					</label>
					{isEditing ? (
						<DatePicker
							value={formData.last_interaction_at}
							onChange={(value) =>
								setFormData((prev) => ({ ...prev, last_interaction_at: value }))
							}
							placeholder="Select last interaction date"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{formatDate(application.last_interaction_at)}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
