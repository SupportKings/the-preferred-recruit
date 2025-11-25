"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { CheckCircle2, ClipboardList, Edit3, Loader2, Save, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { updateAthleteStatusAction } from "../../actions/athleteStatuses";
import { updateAthleteAction } from "../../actions/updateAthlete";

interface AthleteStatusTrackingProps {
	athlete: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
	onAthleteUpdate?: () => void;
}

interface StatusCategory {
	id: number;
	name: string;
	display_name: string;
	sort_order: number;
}

interface StatusOption {
	id: number;
	status_category_id: number;
	name: string;
	display_name: string;
	color: string;
	digit: number;
	is_default: boolean;
}

interface StatusValue {
	id: number;
	status_category_id: number;
	status_option_id: number;
}

export function AthleteStatusTracking({
	athlete,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
	onAthleteUpdate,
}: AthleteStatusTrackingProps) {
	// Use status data from athlete prop (loaded with athlete query)
	const categories: StatusCategory[] = athlete.status_categories || [];
	const options: StatusOption[] = athlete.status_options || [];
	const statusValues: StatusValue[] = athlete.status_values || [];

	const [updatingCategory, setUpdatingCategory] = useState<string | null>(null);
	const [updatingKickoff, setUpdatingKickoff] = useState(false);

	// Form state for pending changes
	const [pendingChanges, setPendingChanges] = useState<
		Record<string, number | null>
	>({});
	const [pendingKickoff, setPendingKickoff] = useState<boolean | null>(null);

	const { execute: executeUpdateStatus } = useAction(
		updateAthleteStatusAction,
		{
			onSuccess: (result) => {
				if (result.data?.success) {
					onAthleteUpdate?.();
				}
			},
			onError: ({ error }) => {
				toast.error(error.serverError || "Failed to update status");
			},
			onSettled: () => {
				setUpdatingCategory(null);
			},
		},
	);

	const { execute: executeUpdateAthlete } = useAction(updateAthleteAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				onAthleteUpdate?.();
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to update athlete");
		},
		onSettled: () => {
			setUpdatingKickoff(false);
		},
	});

	// Reset pending changes when edit mode changes
	useEffect(() => {
		if (!isEditing) {
			setPendingChanges({});
			setPendingKickoff(null);
		}
	}, [isEditing]);

	const getOptionsForCategory = (categoryId: number) => {
		return options.filter((o) => o.status_category_id === categoryId);
	};

	const getCurrentStatusForCategory = (categoryName: string) => {
		// Check pending changes first
		if (pendingChanges[categoryName] !== undefined) {
			return pendingChanges[categoryName];
		}

		const category = categories.find((c) => c.name === categoryName);
		if (!category) return null;

		const statusValue = statusValues.find(
			(sv) => sv.status_category_id === category.id,
		);
		if (statusValue) {
			return statusValue.status_option_id;
		}

		// Return default option if no status set
		const categoryOptions = getOptionsForCategory(category.id);
		const defaultOption = categoryOptions.find((o) => o.is_default);
		return defaultOption?.id || null;
	};

	const getStatusOption = (optionId: number | null) => {
		if (!optionId) return null;
		return options.find((o) => o.id === optionId);
	};

	const handleStatusChange = (categoryName: string, optionId: string) => {
		if (isEditing) {
			// In edit mode, just store pending changes
			setPendingChanges((prev) => ({
				...prev,
				[categoryName]: Number(optionId),
			}));
		} else {
			// Direct update (legacy behavior)
			setUpdatingCategory(categoryName);
			executeUpdateStatus({
				athleteId: athlete.id,
				categoryName,
				statusOptionId: Number(optionId),
			});
		}
	};

	const handleKickoffChange = (checked: boolean) => {
		if (athlete.run_kickoff_automations) return;

		if (isEditing) {
			setPendingKickoff(checked);
		} else {
			if (!checked) return;
			// Validate email before triggering kickoff
			if (!athlete.contact_email) {
				toast.error(
					"Unable to run kickoff automations - athlete email is required",
				);
				return;
			}
			setUpdatingKickoff(true);
			executeUpdateAthlete({
				id: athlete.id,
				run_kickoff_automations: true,
			});
		}
	};

	const handleSave = async () => {
		const hasStatusChanges = Object.keys(pendingChanges).length > 0;
		const hasKickoffChange =
			pendingKickoff === true && !athlete.run_kickoff_automations;

		// Nothing to save
		if (!hasStatusChanges && !hasKickoffChange) {
			onSave?.({});
			return;
		}

		// Validate email before saving kickoff automation
		if (hasKickoffChange) {
			if (!athlete.contact_email) {
				toast.error(
					"Unable to run kickoff automations - athlete email is required",
				);
				setPendingKickoff(null);
				return; // Stop here, don't save anything
			}
		}

		// Save all pending status changes
		const statusPromises = Object.entries(pendingChanges).map(
			([categoryName, optionId]) => {
				if (optionId !== null) {
					return executeUpdateStatus({
						athleteId: athlete.id,
						categoryName,
						statusOptionId: optionId,
					});
				}
				return Promise.resolve();
			},
		);

		// Save kickoff if changed (already validated above)
		if (hasKickoffChange) {
			setUpdatingKickoff(true);
			executeUpdateAthlete({
				id: athlete.id,
				run_kickoff_automations: true,
			});
		}

		await Promise.all(statusPromises);

		onSave?.({});
	};

	const handleCancel = () => {
		setPendingChanges({});
		setPendingKickoff(null);
		onCancel?.();
	};

	const getKickoffValue = () => {
		if (pendingKickoff !== null) return pendingKickoff;
		return athlete.run_kickoff_automations || false;
	};

	const categoryDisplayOrder = [
		"onboarding_call",
		"eval_form_review",
		"poster",
		"campaign_copy",
	];

	const sortedCategories = [...categories].sort((a, b) => {
		const aIndex = categoryDisplayOrder.indexOf(a.name);
		const bIndex = categoryDisplayOrder.indexOf(b.name);
		return aIndex - bIndex;
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ClipboardList className="h-5 w-5" />
						Status Tracking
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
				{/* Run Kickoff Automations */}
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Run Kickoff Automations
					</label>
					{isEditing ? (
						<div className="mt-1 flex items-center space-x-3">
							<Checkbox
								id="run_kickoff_automations"
								checked={getKickoffValue()}
								onCheckedChange={handleKickoffChange}
								disabled={athlete.run_kickoff_automations}
							/>
							<Label
								htmlFor="run_kickoff_automations"
								className={`cursor-pointer font-normal ${
									athlete.run_kickoff_automations ? "text-muted-foreground" : ""
								}`}
							>
								{athlete.run_kickoff_automations
									? "Already triggered"
									: "Enable kickoff automations"}
							</Label>
						</div>
					) : (
						<p className="text-sm">
							{athlete.run_kickoff_automations ? (
								<span className="flex items-center gap-2 text-muted-foreground">
									<CheckCircle2 className="h-4 w-4 text-violet-500" />
									Already triggered
								</span>
							) : (
								"Not enabled"
							)}
						</p>
					)}
				</div>

				{/* Status Categories */}
				{sortedCategories.map((category) => {
					const categoryOptions = getOptionsForCategory(category.id);
					const currentValue = getCurrentStatusForCategory(category.name);
					const currentOption = getStatusOption(currentValue);
					const isUpdating = updatingCategory === category.name;

					return (
						<div key={category.id}>
							<label className="font-medium text-muted-foreground text-sm">
								{category.display_name}
							</label>
							{isEditing ? (
								<div className="mt-1 flex items-center gap-3">
									<Select
										value={currentValue?.toString() || ""}
										onValueChange={(value) =>
											handleStatusChange(category.name, value)
										}
										disabled={isUpdating}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select status">
												{currentOption && (
													<div className="flex items-center gap-2">
														<div
															className="h-3 w-3 rounded-full"
															style={{ backgroundColor: currentOption.color }}
														/>
														{currentOption.display_name}
													</div>
												)}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{categoryOptions.map((option) => (
												<SelectItem
													key={option.id}
													value={option.id.toString()}
												>
													<div className="flex items-center gap-2">
														<div
															className="h-3 w-3 rounded-full"
															style={{ backgroundColor: option.color }}
														/>
														{option.display_name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isUpdating && (
										<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
									)}
								</div>
							) : (
								<p className="text-sm">
									{currentOption ? (
										<span className="flex items-center gap-2">
											<span
												className="inline-block h-3 w-3 rounded-full"
												style={{ backgroundColor: currentOption.color }}
											/>
											{currentOption.display_name}
										</span>
									) : (
										"Not set"
									)}
								</p>
							)}
						</div>
					);
				})}

				{categories.length === 0 && (
					<p className="text-center text-muted-foreground text-sm">
						No status categories configured
					</p>
				)}
			</CardContent>
		</Card>
	);
}
