"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { usePrograms } from "@/features/programs/queries/usePrograms";
import { useUniversities } from "@/features/universities/queries/useUniversities";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createCoachAction } from "../actions/createCoach";
import {
	type CoachFormInput,
	EVENT_GROUP_LABELS,
	EVENT_GROUPS,
	getAllValidationErrors,
} from "../types/coach";

interface CoachFormProps {
	mode?: "create" | "edit";
	initialData?: Partial<CoachFormInput>;
	onSuccess?: () => void;
}

export function CoachForm({
	mode = "create",
	initialData,
	onSuccess,
}: CoachFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [specialtyOpen, setSpecialtyOpen] = useState(false);
	const [universityOpen, setUniversityOpen] = useState(false);
	const [programOpen, setProgramOpen] = useState(false);

	// Fetch universities and programs for dropdowns
	const { data: universities = [], isLoading: isLoadingUniversities } =
		useUniversities();
	const { data: allPrograms = [], isLoading: isLoadingPrograms } =
		usePrograms();

	const { execute } = useAction(createCoachAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success("Coach created successfully");

				// Show warning if university job creation failed
				if (result.data?.warning) {
					toast.warning(result.data.warning);
				}

				queryClient.invalidateQueries({ queryKey: ["coaches"] });

				if (onSuccess) {
					onSuccess();
				} else {
					// Navigate to coach details page
					const coachId = result.data?.data?.id;
					if (coachId) {
						router.push(`/dashboard/coaches/${coachId}`);
					} else {
						router.push("/dashboard/coaches");
					}
				}
			} else if (result.data?.validationErrors) {
				const errors = getAllValidationErrors(result.data.validationErrors);
				for (const error of errors) {
					toast.error(error);
				}
			} else if (result.data?.error) {
				toast.error(result.data.error);
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to create coach");
		},
	});

	const form = useForm({
		defaultValues: {
			full_name: initialData?.full_name || "",
			primary_specialty: initialData?.primary_specialty || "",
			email: initialData?.email || "",
			phone: initialData?.phone || "",
			twitter_profile: initialData?.twitter_profile || "",
			linkedin_profile: initialData?.linkedin_profile || "",
			instagram_profile: initialData?.instagram_profile || "",
			internal_notes: initialData?.internal_notes || "",
			// University job fields
			university_id: initialData?.university_id || "",
			program_id: initialData?.program_id || "",
			job_title: initialData?.job_title || "",
			work_email: initialData?.work_email || "",
			work_phone: initialData?.work_phone || "",
			start_date: initialData?.start_date || "",
			job_internal_notes: initialData?.job_internal_notes || "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				// Check if any university job fields are filled
				const hasUniversityJob =
					value.university_id ||
					value.program_id ||
					value.job_title ||
					value.work_email ||
					value.work_phone ||
					value.start_date ||
					value.job_internal_notes;

				// Transform string values to proper types for server validation
				const transformedData = {
					full_name: value.full_name,
					primary_specialty: value.primary_specialty || undefined,
					email: value.email || undefined,
					phone: value.phone || undefined,
					twitter_profile: value.twitter_profile || undefined,
					linkedin_profile: value.linkedin_profile || undefined,
					instagram_profile: value.instagram_profile || undefined,
					internal_notes: value.internal_notes || undefined,
					university_job: hasUniversityJob
						? {
								university_id: value.university_id || undefined,
								program_id: value.program_id || undefined,
								job_title: value.job_title || undefined,
								work_email: value.work_email || undefined,
								work_phone: value.work_phone || undefined,
								start_date: value.start_date || undefined,
								internal_notes: value.job_internal_notes || undefined,
							}
						: undefined,
				};

				await execute(transformedData as any);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-8"
		>
			{/* Identity Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Identity</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="full_name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="full_name">
									Full Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="full_name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="John Smith"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="primary_specialty">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="primary_specialty">Primary Specialty</Label>
								<Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
									<PopoverTrigger asChild>
										<Button
											id="primary_specialty"
											variant="outline"
											className={cn(
												"w-full justify-between",
												!field.state.value && "text-muted-foreground",
											)}
											type="button"
										>
											{field.state.value
												? EVENT_GROUP_LABELS[
														field.state.value as keyof typeof EVENT_GROUP_LABELS
													]
												: "Select specialty"}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0">
										<Command>
											<CommandInput placeholder="Search specialty..." />
											<CommandList>
												<CommandEmpty>No specialty found.</CommandEmpty>
												<CommandGroup>
													{EVENT_GROUPS.map((specialty) => (
														<CommandItem
															key={specialty}
															value={specialty}
															onSelect={(currentValue) => {
																field.handleChange(
																	currentValue === field.state.value
																		? ""
																		: currentValue,
																);
																setSpecialtyOpen(false);
															}}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	field.state.value === specialty
																		? "opacity-100"
																		: "opacity-0",
																)}
															/>
															{EVENT_GROUP_LABELS[specialty]}
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Contact Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Contact</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="coach@example.com"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="phone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									type="tel"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="+1 (555) 123-4567"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Profiles Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Profiles</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="twitter_profile">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="twitter_profile">Twitter Profile</Label>
								<Input
									id="twitter_profile"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://twitter.com/username"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="linkedin_profile">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
								<Input
									id="linkedin_profile"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://linkedin.com/in/username"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="instagram_profile">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="instagram_profile">Instagram Profile</Label>
								<Input
									id="instagram_profile"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://instagram.com/username"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* University Job Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">University Job (Optional)</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="university_id">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="university_id">University</Label>
								<Popover open={universityOpen} onOpenChange={setUniversityOpen}>
									<PopoverTrigger asChild>
										<Button
											id="university_id"
											variant="outline"
											className={cn(
												"w-full justify-between",
												!field.state.value && "text-muted-foreground",
											)}
											type="button"
											disabled={isLoadingUniversities}
										>
											{isLoadingUniversities
												? "Loading..."
												: field.state.value
													? universities.find(
															(u: any) => u.id === field.state.value,
														)?.name || "Select university"
													: "Select university"}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0">
										<Command>
											<CommandInput placeholder="Search university..." />
											<CommandList>
												<CommandEmpty>No university found.</CommandEmpty>
												<CommandGroup>
													{universities.map((university: any) => (
														<CommandItem
															key={university.id}
															value={`${university.name}-${university.id}`}
															onSelect={() => {
																const newValue =
																	field.state.value === university.id
																		? ""
																		: university.id;
																field.handleChange(newValue);

																// Reset program_id when university changes
																if (newValue !== field.state.value) {
																	form.setFieldValue("program_id", "");
																}

																setUniversityOpen(false);
															}}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	field.state.value === university.id
																		? "opacity-100"
																		: "opacity-0",
																)}
															/>
															{university.name}
															{university.state && ` (${university.state})`}
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Subscribe
						selector={(state) => state.values.university_id}
						children={(universityIdField) => (
							<form.Field name="program_id">
								{(field) => {
									// Filter programs based on selected university
									const filteredPrograms = universityIdField
										? allPrograms.filter(
												(p: any) => p.university_id === universityIdField,
											)
										: [];

									const selectedUniversity = universities.find(
										(u: any) => u.id === universityIdField,
									);

									return (
										<div className="space-y-2">
											<Label htmlFor="program_id">Program</Label>
											<Popover open={programOpen} onOpenChange={setProgramOpen}>
												<PopoverTrigger asChild>
													<Button
														id="program_id"
														variant="outline"
														className={cn(
															"w-full justify-between",
															!field.state.value && "text-muted-foreground",
														)}
														type="button"
														disabled={isLoadingPrograms || !universityIdField}
													>
														{!universityIdField
															? "Select university first"
															: isLoadingPrograms
																? "Loading..."
																: field.state.value
																	? (() => {
																			const program = filteredPrograms.find(
																				(p: any) => p.id === field.state.value,
																			);
																			return program
																				? `${selectedUniversity?.name || "Unknown"} - ${program.gender || "Unknown"}`
																				: "Select program";
																		})()
																	: filteredPrograms.length === 0
																		? "No programs available"
																		: "Select program"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-full p-0">
													<Command>
														<CommandInput placeholder="Search program..." />
														<CommandList>
															<CommandEmpty>
																{filteredPrograms.length === 0
																	? "No programs available for this university."
																	: "No program found."}
															</CommandEmpty>
															<CommandGroup>
																{filteredPrograms.map((program: any) => (
																	<CommandItem
																		key={program.id}
																		value={`${selectedUniversity?.name}-${program.gender}-${program.id}`}
																		onSelect={() => {
																			field.handleChange(
																				field.state.value === program.id
																					? ""
																					: program.id,
																			);
																			setProgramOpen(false);
																		}}
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				field.state.value === program.id
																					? "opacity-100"
																					: "opacity-0",
																			)}
																		/>
																		{selectedUniversity?.name || "Unknown"} -{" "}
																		{program.gender || "Unknown"}
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
											{field.state.meta.errors.length > 0 && (
												<p className="text-destructive text-sm">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									);
								}}
							</form.Field>
						)}
					/>

					<form.Field name="job_title">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="job_title">Job Title</Label>
								<Input
									id="job_title"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Head Coach, Assistant Coach, etc."
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="work_email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="work_email">Work Email</Label>
								<Input
									id="work_email"
									type="email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="coach@university.edu"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="work_phone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="work_phone">Work Phone</Label>
								<Input
									id="work_phone"
									type="tel"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="+1 (555) 123-4567"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="start_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="start_date">Start Date</Label>
								<DatePicker
									id="start_date"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select start date"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<form.Field name="job_internal_notes">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="job_internal_notes">Job Internal Notes</Label>
								<Textarea
									id="job_internal_notes"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Add any internal notes about this position..."
									rows={3}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Internal Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Internal</h2>
				<div className="grid grid-cols-1 gap-4">
					<form.Field name="internal_notes">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="internal_notes">Internal Notes</Label>
								<Textarea
									id="internal_notes"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Add any internal notes about this coach..."
									rows={5}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-4">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "create" ? "Create Coach" : "Update Coach"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/dashboard/coaches")}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
