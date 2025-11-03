import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { US_TIMEZONES } from "@/features/team-members/types/team-member";

import { Check, ChevronsUpDown, Edit3, Save, User, X } from "lucide-react";

interface TeamMemberBasicInfoFormData {
	name: string;
	job_title: string;
	timezone: string;
	internal_notes: string;
}

interface TeamMemberBasicInfoProps {
	teamMember: {
		name: string;
		job_title?: string | null;
		timezone?: string | null;
		internal_notes?: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: TeamMemberBasicInfoFormData) => void;
	onCancel?: () => void;
}

export function TeamMemberBasicInfo({
	teamMember,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: TeamMemberBasicInfoProps) {
	const [formData, setFormData] = useState({
		name: teamMember.name,
		job_title: teamMember.job_title || "",
		timezone: teamMember.timezone || "",
		internal_notes: teamMember.internal_notes || "",
	});
	const [timezoneOpen, setTimezoneOpen] = useState(false);

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			name: teamMember.name,
			job_title: teamMember.job_title || "",
			timezone: teamMember.timezone || "",
			internal_notes: teamMember.internal_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Profile & Status
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
					<Label className="font-medium text-muted-foreground text-sm">
						Name
					</Label>
					{isEditing ? (
						<Input
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							className="mt-1"
							placeholder="Enter full name"
						/>
					) : (
						<p className="text-sm">{teamMember.name}</p>
					)}
				</div>
				<div>
					<Label className="font-medium text-muted-foreground text-sm">
						Job Title
					</Label>
					{isEditing ? (
						<Input
							value={formData.job_title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, job_title: e.target.value }))
							}
							className="mt-1"
							placeholder="Enter job title"
						/>
					) : (
						<p className="text-sm">{teamMember.job_title || "Not provided"}</p>
					)}
				</div>
				<div>
					<Label className="font-medium text-muted-foreground text-sm">
						Time Zone
					</Label>
					{isEditing ? (
						<Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={timezoneOpen}
									className="mt-1 w-full justify-between"
								>
									<span className="truncate">
										{formData.timezone
											? US_TIMEZONES.find(
													(tz) => tz.value === formData.timezone,
												)?.label
											: "Select timezone"}
									</span>
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
								<Command>
									<CommandInput placeholder="Search timezone..." />
									<CommandList>
										<CommandEmpty>No timezone found.</CommandEmpty>
										<CommandGroup>
											{US_TIMEZONES.map((tz) => (
												<CommandItem
													key={tz.value}
													value={tz.value}
													onSelect={(currentValue) => {
														setFormData((prev) => ({
															...prev,
															timezone:
																currentValue === prev.timezone
																	? ""
																	: currentValue,
														}));
														setTimezoneOpen(false);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															formData.timezone === tz.value
																? "opacity-100"
																: "opacity-0",
														)}
													/>
													{tz.label}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					) : (
						<p className="text-sm">
							{teamMember.timezone
								? US_TIMEZONES.find((tz) => tz.value === teamMember.timezone)
										?.label || teamMember.timezone
								: "Not provided"}
						</p>
					)}
				</div>
				<div>
					<Label className="font-medium text-muted-foreground text-sm">
						Internal Notes
					</Label>
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
							placeholder="Enter internal notes"
							rows={4}
							maxLength={5000}
						/>
					) : (
						<p className="whitespace-pre-wrap text-sm">
							{teamMember.internal_notes || "No notes"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
