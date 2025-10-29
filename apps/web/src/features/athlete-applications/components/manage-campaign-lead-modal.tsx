"use client";

import { type ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
	createCampaignLead,
	updateCampaignLead,
} from "@/features/athlete-applications/actions/relations/campaign-leads";
import { applicationQueries } from "@/features/athlete-applications/queries/useApplications";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Edit, Plus, Search, Target, X } from "lucide-react";
import { toast } from "sonner";

interface ManageCampaignLeadModalProps {
	applicationId: string;
	mode: "add" | "edit";
	lead?: any;
	campaigns?: Array<{ id: string; name: string; type: string }>;
	universities?: Array<{ id: string; name: string; city: string | null }>;
	programs?: Array<{ id: string; gender: string; university_id: string }>;
	coaches?: Array<{
		id: string;
		full_name: string;
		university_jobs: Array<{
			id: string;
			job_title: string;
			work_email: string | null;
		}>;
	}>;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const leadStatuses = ["pending", "replied", "suppressed"];

export function ManageCampaignLeadModal({
	applicationId,
	mode,
	lead,
	campaigns = [],
	universities = [],
	programs = [],
	coaches = [],
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageCampaignLeadModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const [coachSearch, setCoachSearch] = useState("");
	const [coachPopoverOpen, setCoachPopoverOpen] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		campaign_id: null as string | null,
		university_id: null as string | null,
		program_id: null as string | null,
		university_job_id: null as string | null,
		status: "pending" as string,
		include_reason: "",
		internal_notes: "",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && lead) {
			setFormData({
				campaign_id: lead.campaign_id || null,
				university_id: lead.university_id || null,
				program_id: lead.program_id || null,
				university_job_id: lead.university_job_id || null,
				status: lead.status || "pending",
				include_reason: lead.include_reason || "",
				internal_notes: lead.internal_notes || "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				campaign_id: null,
				university_id: null,
				program_id: null,
				university_job_id: null,
				status: "pending",
				include_reason: "",
				internal_notes: "",
			});
		}
	}, [isEdit, lead]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isEdit && !formData.campaign_id) {
			toast.error("Campaign is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && lead) {
				await updateCampaignLead(lead.id, {
					status: formData.status,
					include_reason: formData.include_reason || null,
					internal_notes: formData.internal_notes || null,
				});
				toast.success("Campaign lead updated successfully!");
			} else {
				await createCampaignLead(applicationId, {
					campaign_id: formData.campaign_id,
					university_id: formData.university_id,
					program_id: formData.program_id,
					university_job_id: formData.university_job_id,
					status: formData.status,
					include_reason: formData.include_reason || null,
					internal_notes: formData.internal_notes || null,
				});
				toast.success("Campaign lead added successfully!");
			}

			// Invalidate the application query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: applicationQueries.detail(applicationId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} campaign lead:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} campaign lead`);
		} finally {
			setIsLoading(false);
		}
	};

	// Filter programs based on selected university
	const filteredPrograms = formData.university_id
		? programs.filter((p) => p.university_id === formData.university_id)
		: programs;

	// Filter coaches based on search
	const filteredCoaches = coaches.filter((coach) =>
		coach.full_name.toLowerCase().includes(coachSearch.toLowerCase()),
	);

	// Filter coaches' jobs based on search
	const availableJobs = filteredCoaches.flatMap((coach) =>
		coach.university_jobs.map((job) => ({
			...job,
			coach_full_name: coach.full_name,
			coach_id: coach.id,
		})),
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							{isEdit ? (
								<Edit className="h-4 w-4" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							{isEdit ? "Edit Lead" : "Add Lead"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						{isEdit ? "Edit Campaign Lead" : "Add New Campaign Lead"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the campaign lead details."
							: "Link a new campaign lead to this application."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Fields only shown in Create mode */}
					{!isEdit && (
						<>
							<div className="space-y-2">
								<Label htmlFor="campaign_id">Campaign *</Label>
								<Select
									value={formData.campaign_id || "NONE"}
									onValueChange={(value) =>
										setFormData({
											...formData,
											campaign_id: value === "NONE" ? null : value,
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select campaign..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="NONE">None</SelectItem>
										{campaigns.map((campaign) => (
											<SelectItem key={campaign.id} value={campaign.id}>
												{campaign.name} ({campaign.type})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="university_id">University</Label>
								<Select
									value={formData.university_id || "NONE"}
									onValueChange={(value) =>
										setFormData({
											...formData,
											university_id: value === "NONE" ? null : value,
											program_id: null, // Reset program when university changes
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select university..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="NONE">None</SelectItem>
										{universities.map((university) => (
											<SelectItem key={university.id} value={university.id}>
												{university.name}
												{university.city && ` (${university.city})`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="program_id">Program</Label>
								<Select
									value={formData.program_id || "NONE"}
									onValueChange={(value) =>
										setFormData({
											...formData,
											program_id: value === "NONE" ? null : value,
										})
									}
									disabled={!formData.university_id}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												formData.university_id
													? "Select program..."
													: "Select university first"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="NONE">None</SelectItem>
										{filteredPrograms.map((program) => (
											<SelectItem key={program.id} value={program.id}>
												{program.gender
													? `${program.gender.charAt(0).toUpperCase()}${program.gender.slice(1)}'s`
													: "Unknown"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="coach_search">Coach/Job (Optional)</Label>
								<Popover
									open={coachPopoverOpen}
									onOpenChange={setCoachPopoverOpen}
								>
									<PopoverTrigger asChild>
										<div className="relative">
											<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
												<Search className="h-4 w-4 text-muted-foreground" />
											</div>
											<Input
												type="text"
												placeholder={
													formData.university_job_id
														? ""
														: "Search for a coach or job..."
												}
												value={coachSearch}
												onChange={(e) => {
													setCoachSearch(e.target.value);
													if (!coachPopoverOpen) setCoachPopoverOpen(true);
												}}
												onFocus={() => setCoachPopoverOpen(true)}
												className="pr-8 pl-9"
											/>
											{formData.university_job_id && !coachSearch && (
												<div className="absolute inset-y-0 right-8 left-9 flex items-center">
													<Badge
														variant="secondary"
														className="max-w-full truncate"
													>
														{availableJobs.find(
															(job) => job.id === formData.university_job_id,
														)?.coach_full_name || "Selected coach"}
													</Badge>
												</div>
											)}
											{formData.university_job_id && (
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setFormData({
															...formData,
															university_job_id: null,
														});
														setCoachSearch("");
														setCoachPopoverOpen(false);
													}}
													className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
												>
													<X className="h-4 w-4" />
												</button>
											)}
										</div>
									</PopoverTrigger>
									<PopoverContent
										className="w-[var(--radix-popover-trigger-width)] p-0"
										align="start"
									>
										<Command shouldFilter={false}>
											<CommandList>
												<CommandEmpty>
													{coachSearch
														? "No coaches found matching your search."
														: "Start typing to search for coaches..."}
												</CommandEmpty>
												<CommandGroup>
													{availableJobs.length > 0 &&
														availableJobs.map((job) => (
															<CommandItem
																key={job.id}
																value={job.id}
																onSelect={() => {
																	setFormData({
																		...formData,
																		university_job_id: job.id,
																	});
																	setCoachSearch("");
																	setCoachPopoverOpen(false);
																}}
																className="cursor-pointer"
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		formData.university_job_id === job.id
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																<div className="flex flex-col">
																	<span className="font-medium">
																		{job.coach_full_name} - {job.job_title}
																	</span>
																	{job.work_email && (
																		<span className="text-muted-foreground text-xs">
																			{job.work_email}
																		</span>
																	)}
																</div>
															</CommandItem>
														))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
						</>
					)}

					{/* Fields shown in both Create and Edit mode */}
					<div className="space-y-2">
						<Label htmlFor="status">Lead Status *</Label>
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData({ ...formData, status: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{leadStatuses.map((status) => (
									<SelectItem key={status} value={status}>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="include_reason">Include Reason</Label>
						<Textarea
							id="include_reason"
							placeholder="Why this lead was included"
							value={formData.include_reason}
							onChange={(e) =>
								setFormData({ ...formData, include_reason: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this lead"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? isEdit
									? "Updating..."
									: "Adding..."
								: isEdit
									? "Update Lead"
									: "Add Lead"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
