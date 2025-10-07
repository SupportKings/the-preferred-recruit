"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createAthleteAction } from "../actions/createAthlete";
import { useTeamMembers } from "../queries/useAthletes";
import {
	ATHLETE_GENDERS,
	type AthleteFormInput,
	athleteFormSchema,
	getAllValidationErrors,
	PAYMENT_TYPES,
	STUDENT_TYPES,
} from "../types/athlete";

interface AthleteFormProps {
	mode?: "create" | "edit";
	initialData?: Partial<AthleteFormInput>;
	onSuccess?: () => void;
}

export function AthleteForm({
	mode = "create",
	initialData,
	onSuccess,
}: AthleteFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [salesSetterOpen, setSalesSetterOpen] = useState(false);
	const [salesCloserOpen, setSalesCloserOpen] = useState(false);

	// Fetch team members for lookup fields
	const { data: teamMembers = [], isPending: isTeamMembersPending } =
		useTeamMembers();

	const { execute } = useAction(createAthleteAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success("Athlete created successfully");
				queryClient.invalidateQueries({ queryKey: ["athletes"] });

				if (onSuccess) {
					onSuccess();
				} else {
					router.push("/dashboard/athletes");
				}
			} else if (result.data?.validationErrors) {
				const errors = getAllValidationErrors(result.data.validationErrors);
				errors.forEach((error) => toast.error(error));
			} else if (result.data?.error) {
				toast.error(result.data.error);
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to create athlete");
		},
	});

	const form = useForm<AthleteFormInput>({
		defaultValues: {
			full_name: initialData?.full_name || "",
			contact_email: initialData?.contact_email || "",
			phone: initialData?.phone || "",
			instagram_handle: initialData?.instagram_handle || "",
			gender: initialData?.gender || "",
			date_of_birth: initialData?.date_of_birth || "",
			high_school: initialData?.high_school || "",
			city: initialData?.city || "",
			state: initialData?.state || "",
			country: initialData?.country || "",
			graduation_year: initialData?.graduation_year || "",
			year_entering_university: initialData?.year_entering_university || "",
			athlete_net_url: initialData?.athlete_net_url || "",
			milesplit_url: initialData?.milesplit_url || "",
			google_drive_folder_url: initialData?.google_drive_folder_url || "",
			sat_score: initialData?.sat_score || "",
			act_score: initialData?.act_score || "",
			contract_date: initialData?.contract_date || "",
			go_live_date: initialData?.go_live_date || "",
			sales_setter_id: initialData?.sales_setter_id || "",
			sales_closer_id: initialData?.sales_closer_id || "",
			lead_source: initialData?.lead_source || "",
			last_sales_call_at: initialData?.last_sales_call_at || "",
			sales_call_note: initialData?.sales_call_note || "",
			sales_call_recording_url: initialData?.sales_call_recording_url || "",
			initial_contract_amount_usd:
				initialData?.initial_contract_amount_usd || "",
			initial_cash_collected_usd: initialData?.initial_cash_collected_usd || "",
			initial_payment_type: initialData?.initial_payment_type || "",
			student_type: initialData?.student_type || "",
			discord_channel_url: initialData?.discord_channel_url || "",
			discord_channel_id: initialData?.discord_channel_id || "",
			discord_username: initialData?.discord_username || "",
			internal_notes: initialData?.internal_notes || "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				// Transform string values to proper types for server validation
				const transformedData = {
					full_name: value.full_name,
					contact_email: value.contact_email || undefined,
					phone: value.phone || undefined,
					instagram_handle: value.instagram_handle || undefined,
					gender: value.gender || undefined,
					date_of_birth: value.date_of_birth || undefined,
					high_school: value.high_school || undefined,
					city: value.city || undefined,
					state: value.state || undefined,
					country: value.country || undefined,
					graduation_year: value.graduation_year
						? Number(value.graduation_year)
						: undefined,
					year_entering_university: value.year_entering_university
						? Number(value.year_entering_university)
						: undefined,
					athlete_net_url: value.athlete_net_url || undefined,
					milesplit_url: value.milesplit_url || undefined,
					google_drive_folder_url: value.google_drive_folder_url || undefined,
					sat_score: value.sat_score ? Number(value.sat_score) : undefined,
					act_score: value.act_score ? Number(value.act_score) : undefined,
					contract_date: value.contract_date || undefined,
					go_live_date: value.go_live_date || undefined,
					sales_setter_id: value.sales_setter_id || undefined,
					sales_closer_id: value.sales_closer_id || undefined,
					lead_source: value.lead_source || undefined,
					last_sales_call_at: value.last_sales_call_at || undefined,
					sales_call_note: value.sales_call_note || undefined,
					sales_call_recording_url: value.sales_call_recording_url || undefined,
					initial_contract_amount_usd: value.initial_contract_amount_usd
						? Number(value.initial_contract_amount_usd)
						: undefined,
					initial_cash_collected_usd: value.initial_cash_collected_usd
						? Number(value.initial_cash_collected_usd)
						: undefined,
					initial_payment_type: value.initial_payment_type || undefined,
					student_type: value.student_type || undefined,
					discord_channel_url: value.discord_channel_url || undefined,
					discord_channel_id: value.discord_channel_id || undefined,
					discord_username: value.discord_username || undefined,
					internal_notes: value.internal_notes || undefined,
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
			{/* Identity & Contact Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Identity & Contact</h2>
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
									placeholder="John Doe"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="contact_email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="contact_email">Email</Label>
								<Input
									id="contact_email"
									type="email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="john.doe@example.com"
								/>
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
							</div>
						)}
					</form.Field>

					<form.Field name="instagram_handle">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="instagram_handle">Instagram</Label>
								<Input
									id="instagram_handle"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="@johndoe"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="gender">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="gender">Gender</Label>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger id="gender">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										{ATHLETE_GENDERS.map((gender) => (
											<SelectItem key={gender} value={gender}>
												{gender.charAt(0).toUpperCase() + gender.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name="date_of_birth">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="date_of_birth">Date of Birth</Label>
								<Input
									id="date_of_birth"
									type="date"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Schooling Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Schooling</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="high_school">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="high_school">High School</Label>
								<Input
									id="high_school"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Lincoln High School"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="city">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Springfield"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="state">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="state">State</Label>
								<Input
									id="state"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="IL"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="country">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="country">Country</Label>
								<Input
									id="country"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="USA"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="graduation_year">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="graduation_year">Graduation Year</Label>
								<Input
									id="graduation_year"
									type="number"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="2025"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="year_entering_university">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="year_entering_university">
									Year Entering University
								</Label>
								<Input
									id="year_entering_university"
									type="number"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="2025"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Profiles & Academic Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Profiles & Academic</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="athlete_net_url">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="athlete_net_url">Athletic.net URL</Label>
								<Input
									id="athlete_net_url"
									type="url"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://www.athletic.net/..."
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="milesplit_url">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="milesplit_url">MileSplit URL</Label>
								<Input
									id="milesplit_url"
									type="url"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://www.milesplit.com/..."
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="google_drive_folder_url">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="google_drive_folder_url">
									Google Drive Folder
								</Label>
								<Input
									id="google_drive_folder_url"
									type="url"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://drive.google.com/..."
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="sat_score">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="sat_score">SAT Score</Label>
								<Input
									id="sat_score"
									type="number"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="1200"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="act_score">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="act_score">ACT Score</Label>
								<Input
									id="act_score"
									type="number"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="28"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Contract & Sales Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Contract & Sales</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="contract_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="contract_date">Contract Date</Label>
								<Input
									id="contract_date"
									type="date"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="go_live_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="go_live_date">Go Live Date</Label>
								<Input
									id="go_live_date"
									type="date"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="sales_setter_id">
						{(field) => {
							const selectedMember = teamMembers.find(
								(m: any) => m.id === field.state.value,
							);

							return (
								<div className="space-y-2">
									<Label htmlFor="sales_setter_id">Sales Setter</Label>
									<Popover
										open={salesSetterOpen}
										onOpenChange={setSalesSetterOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={salesSetterOpen}
												className="w-full justify-between"
												type="button"
											>
												{selectedMember
													? `${selectedMember.first_name} ${selectedMember.last_name}${selectedMember.job_title ? ` - ${selectedMember.job_title}` : ""}`
													: "Select team member..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0">
											<Command>
												<CommandInput placeholder="Search team members..." />
												<CommandList>
													<CommandEmpty>No team member found.</CommandEmpty>
													<CommandGroup>
														{teamMembers.map((member: any) => (
															<CommandItem
																key={member.id}
																value={`${member.first_name} ${member.last_name}`}
																onSelect={() => {
																	field.handleChange(member.id);
																	setSalesSetterOpen(false);
																}}
															>
																<Check
																	className={`mr-2 h-4 w-4 ${
																		field.state.value === member.id
																			? "opacity-100"
																			: "opacity-0"
																	}`}
																/>
																{member.first_name} {member.last_name}
																{member.job_title && ` - ${member.job_title}`}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="sales_closer_id">
						{(field) => {
							const selectedMember = teamMembers.find(
								(m: any) => m.id === field.state.value,
							);

							return (
								<div className="space-y-2">
									<Label htmlFor="sales_closer_id">Sales Closer</Label>
									<Popover
										open={salesCloserOpen}
										onOpenChange={setSalesCloserOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={salesCloserOpen}
												className="w-full justify-between"
												type="button"
											>
												{selectedMember
													? `${selectedMember.first_name} ${selectedMember.last_name}${selectedMember.job_title ? ` - ${selectedMember.job_title}` : ""}`
													: "Select team member..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0">
											<Command>
												<CommandInput placeholder="Search team members..." />
												<CommandList>
													<CommandEmpty>No team member found.</CommandEmpty>
													<CommandGroup>
														{teamMembers.map((member: any) => (
															<CommandItem
																key={member.id}
																value={`${member.first_name} ${member.last_name}`}
																onSelect={() => {
																	field.handleChange(member.id);
																	setSalesCloserOpen(false);
																}}
															>
																<Check
																	className={`mr-2 h-4 w-4 ${
																		field.state.value === member.id
																			? "opacity-100"
																			: "opacity-0"
																	}`}
																/>
																{member.first_name} {member.last_name}
																{member.job_title && ` - ${member.job_title}`}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="lead_source">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="lead_source">Lead Source</Label>
								<Input
									id="lead_source"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Instagram, Referral, etc."
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="last_sales_call_at">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="last_sales_call_at">Last Sales Call</Label>
								<Input
									id="last_sales_call_at"
									type="date"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="sales_call_recording_url">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="sales_call_recording_url">
									Sales Call Recording URL
								</Label>
								<Input
									id="sales_call_recording_url"
									type="url"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://..."
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="initial_contract_amount_usd">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="initial_contract_amount_usd">
									Initial Contract Amount (USD)
								</Label>
								<Input
									id="initial_contract_amount_usd"
									type="number"
									step="0.01"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="5000.00"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="initial_cash_collected_usd">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="initial_cash_collected_usd">
									Initial Cash Collected (USD)
								</Label>
								<Input
									id="initial_cash_collected_usd"
									type="number"
									step="0.01"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="2500.00"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="initial_payment_type">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="initial_payment_type">
									Initial Payment Type
								</Label>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger id="initial_payment_type">
										<SelectValue placeholder="Select payment type" />
									</SelectTrigger>
									<SelectContent>
										{PAYMENT_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{type
													.split("_")
													.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
													.join(" ")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name="student_type">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="student_type">Student Type</Label>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger id="student_type">
										<SelectValue placeholder="Select student type" />
									</SelectTrigger>
									<SelectContent>
										{STUDENT_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{type
													.split("_")
													.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
													.join(" ")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<div className="md:col-span-2">
						<form.Field name="sales_call_note">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="sales_call_note">Sales Call Notes</Label>
									<Textarea
										id="sales_call_note"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder="Notes from the sales call..."
										rows={4}
									/>
								</div>
							)}
						</form.Field>
					</div>
				</div>
			</div>

			{/* Discord Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Discord</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="discord_channel_url">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="discord_channel_url">Discord Channel URL</Label>
								<Input
									id="discord_channel_url"
									type="url"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://discord.com/channels/..."
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="discord_channel_id">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="discord_channel_id">Discord Channel ID</Label>
								<Input
									id="discord_channel_id"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="123456789012345678"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="discord_username">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="discord_username">Discord Username</Label>
								<Input
									id="discord_username"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="username#1234"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Internal Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Internal</h2>
				<form.Field name="internal_notes">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="internal_notes">Internal Notes</Label>
							<Textarea
								id="internal_notes"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Private notes for internal use..."
								rows={6}
							/>
						</div>
					)}
				</form.Field>
			</div>

			{/* Action Buttons */}
			<div className="flex items-center gap-4">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "create" ? "Create Athlete" : "Update Athlete"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
