"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { City, State } from "country-state-city";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createUniversityAction } from "../actions/createUniversity";
import {
	citySizeOptions,
	getAllValidationErrors,
	publicPrivateOptions,
	type UniversityFormData,
} from "../types/university";
import { ConferenceLookup } from "./lookups/conference-lookup";
import { DivisionLookup } from "./lookups/division-lookup";

interface UniversityFormProps {
	mode?: "create" | "edit";
	initialData?: Partial<UniversityFormData>;
	onSuccess?: () => void;
}

export function UniversityForm({
	mode = "create",
	initialData,
	onSuccess,
}: UniversityFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [stateOpen, setStateOpen] = useState(false);
	const [cityOpen, setCityOpen] = useState(false);
	const [citySizeOpen, setCitySizeOpen] = useState(false);
	const [typeOpen, setTypeOpen] = useState(false);

	// Get US states
	const usStates = useMemo(() => {
		return State.getStatesOfCountry("US").sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, []);

	// Get cities for selected state
	const getCitiesForState = (stateCode: string) => {
		if (!stateCode) return [];
		return City.getCitiesOfState("US", stateCode).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	};

	const { execute } = useAction(createUniversityAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success("University created successfully");
				queryClient.invalidateQueries({ queryKey: ["universities"] });

				if (onSuccess) {
					onSuccess();
				} else {
					// Navigate to the university details page
					const universityId = result.data?.data?.id;
					if (universityId) {
						router.push(`/dashboard/universities/${universityId}`);
					} else {
						router.push("/dashboard/universities");
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
			toast.error(error.serverError || "Failed to create university");
		},
	});

	const form = useForm({
		defaultValues: {
			name: initialData?.name || "",
			email_blocked: initialData?.email_blocked || false,
			type_public_private: initialData?.type_public_private || "",
			religious_affiliation: initialData?.religious_affiliation || "",
			city: initialData?.city || "",
			size_of_city: initialData?.size_of_city || "",
			state: initialData?.state
				? usStates.find((s) => s.isoCode === initialData.state)?.isoCode ||
					initialData.state
				: "",
			region: initialData?.region || "",
			conferenceId: "",
			divisionId: "",
			average_gpa: initialData?.average_gpa || "",
			sat_ebrw_25th: initialData?.sat_ebrw_25th || "",
			sat_ebrw_75th: initialData?.sat_ebrw_75th || "",
			sat_math_25th: initialData?.sat_math_25th || "",
			sat_math_75th: initialData?.sat_math_75th || "",
			act_composite_25th: initialData?.act_composite_25th || "",
			act_composite_75th: initialData?.act_composite_75th || "",
			acceptance_rate_pct: initialData?.acceptance_rate_pct || "",
			total_yearly_cost: initialData?.total_yearly_cost || "",
			majors_offered_url: initialData?.majors_offered_url || "",
			undergraduate_enrollment: initialData?.undergraduate_enrollment || "",
			us_news_ranking_national_2018:
				initialData?.us_news_ranking_national_2018 || "",
			us_news_ranking_liberal_arts_2018:
				initialData?.us_news_ranking_liberal_arts_2018 || "",
			ipeds_nces_id: initialData?.ipeds_nces_id || "",
			internal_notes: initialData?.internal_notes || "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				// Transform string values to proper types for server validation
				const transformedData = {
					name: value.name,
					email_blocked: value.email_blocked,
					type_public_private: value.type_public_private || null,
					religious_affiliation: value.religious_affiliation || null,
					city: value.city || null,
					size_of_city: value.size_of_city || null,
					state: value.state || null,
					region: value.region || null,
					conferenceId: value.conferenceId || null,
					divisionId: value.divisionId || null,
					average_gpa: value.average_gpa ? Number(value.average_gpa) : null,
					sat_ebrw_25th: value.sat_ebrw_25th
						? Number(value.sat_ebrw_25th)
						: null,
					sat_ebrw_75th: value.sat_ebrw_75th
						? Number(value.sat_ebrw_75th)
						: null,
					sat_math_25th: value.sat_math_25th
						? Number(value.sat_math_25th)
						: null,
					sat_math_75th: value.sat_math_75th
						? Number(value.sat_math_75th)
						: null,
					act_composite_25th: value.act_composite_25th
						? Number(value.act_composite_25th)
						: null,
					act_composite_75th: value.act_composite_75th
						? Number(value.act_composite_75th)
						: null,
					acceptance_rate_pct: value.acceptance_rate_pct
						? Number(value.acceptance_rate_pct)
						: null,
					total_yearly_cost: value.total_yearly_cost
						? Number(value.total_yearly_cost)
						: null,
					majors_offered_url: value.majors_offered_url || null,
					undergraduate_enrollment: value.undergraduate_enrollment
						? Number(value.undergraduate_enrollment)
						: null,
					us_news_ranking_national_2018: value.us_news_ranking_national_2018
						? Number(value.us_news_ranking_national_2018)
						: null,
					us_news_ranking_liberal_arts_2018:
						value.us_news_ranking_liberal_arts_2018
							? Number(value.us_news_ranking_liberal_arts_2018)
							: null,
					ipeds_nces_id: value.ipeds_nces_id || null,
					internal_notes: value.internal_notes || null,
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
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="name">
									University Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Stanford University"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="email_blocked">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Switch
									id="email_blocked"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
								<Label htmlFor="email_blocked" className="cursor-pointer">
									Email Blocked
								</Label>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Classifications Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Classifications</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="type_public_private">
						{(field) => {
							const selectedType = publicPrivateOptions.find(
								(opt) => opt.value === field.state.value,
							);

							return (
								<div className="space-y-2">
									<Label htmlFor="type_public_private">Public/Private</Label>
									<Popover open={typeOpen} onOpenChange={setTypeOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={typeOpen}
												className="w-full justify-between"
												type="button"
											>
												{selectedType ? selectedType.label : "Select type..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0">
											<Command>
												<CommandInput placeholder="Search type..." />
												<CommandList>
													<CommandEmpty>No type found.</CommandEmpty>
													<CommandGroup>
														{publicPrivateOptions.map((option) => (
															<CommandItem
																key={option.value}
																value={option.label}
																onSelect={() => {
																	field.handleChange(option.value);
																	setTypeOpen(false);
																}}
															>
																<Check
																	className={`mr-2 h-4 w-4 ${
																		field.state.value === option.value
																			? "opacity-100"
																			: "opacity-0"
																	}`}
																/>
																{option.label}
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

					<form.Field name="religious_affiliation">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="religious_affiliation">
									Religious Affiliation
								</Label>
								<Input
									id="religious_affiliation"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="e.g., Catholic, None, etc."
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Location Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Location</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="state">
						{(field) => {
							const selectedState = usStates.find(
								(s) => s.isoCode === field.state.value,
							);

							return (
								<div className="space-y-2">
									<Label htmlFor="state">State</Label>
									<Popover open={stateOpen} onOpenChange={setStateOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={stateOpen}
												className="w-full justify-between"
												type="button"
											>
												{selectedState ? selectedState.name : "Select state..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0" align="start">
											<Command>
												<CommandInput placeholder="Search states..." />
												<CommandList>
													<CommandEmpty>No state found.</CommandEmpty>
													<CommandGroup>
														{usStates.map((state) => (
															<CommandItem
																key={state.isoCode}
																value={state.name}
																onSelect={() => {
																	field.handleChange(state.isoCode);
																	// Clear city when state changes
																	form.setFieldValue("city", "");
																	setStateOpen(false);
																}}
															>
																<Check
																	className={`mr-2 h-4 w-4 ${
																		field.state.value === state.isoCode
																			? "opacity-100"
																			: "opacity-0"
																	}`}
																/>
																{state.name}
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

					<form.Field name="city">
						{(field) => {
							const stateValue = form.getFieldValue("state");
							const cities = stateValue ? getCitiesForState(stateValue) : [];
							const selectedCity = cities.find(
								(c) => c.name === field.state.value,
							);

							return (
								<div className="space-y-2">
									<Label htmlFor="city">City</Label>
									<Popover open={cityOpen} onOpenChange={setCityOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={cityOpen}
												className="w-full justify-between"
												type="button"
												disabled={!stateValue}
											>
												{selectedCity
													? selectedCity.name
													: stateValue
														? "Select city..."
														: "Select state first..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0" align="start">
											<Command>
												<CommandInput placeholder="Search cities..." />
												<CommandList>
													<CommandEmpty>No city found.</CommandEmpty>
													<CommandGroup>
														{cities.map((city) => (
															<CommandItem
																key={city.name}
																value={city.name}
																onSelect={() => {
																	field.handleChange(city.name);
																	setCityOpen(false);
																}}
															>
																<Check
																	className={`mr-2 h-4 w-4 ${
																		field.state.value === city.name
																			? "opacity-100"
																			: "opacity-0"
																	}`}
																/>
																{city.name}
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

					<form.Field name="size_of_city">
						{(field) => {
							const selectedSize = citySizeOptions.find(
								(opt) => opt.value === field.state.value,
							);

							return (
								<div className="space-y-2">
									<Label htmlFor="size_of_city">City Size</Label>
									<Popover open={citySizeOpen} onOpenChange={setCitySizeOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={citySizeOpen}
												className="w-full justify-between"
												type="button"
											>
												{selectedSize ? selectedSize.label : "Select size..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0">
											<Command>
												<CommandInput placeholder="Search size..." />
												<CommandList>
													<CommandEmpty>No size found.</CommandEmpty>
													<CommandGroup>
														{citySizeOptions.map((option) => (
															<CommandItem
																key={option.value}
																value={option.label}
																onSelect={() => {
																	field.handleChange(option.value);
																	setCitySizeOpen(false);
																}}
															>
																<Check
																	className={`mr-2 h-4 w-4 ${
																		field.state.value === option.value
																			? "opacity-100"
																			: "opacity-0"
																	}`}
																/>
																{option.label}
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

					<form.Field name="region">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="region">Region/Country</Label>
								<Input
									id="region"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="West Coast, USA"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="conferenceId">
						{(field) => (
							<div className="space-y-2">
								<ConferenceLookup
									value={field.state.value}
									onChange={field.handleChange}
									label="Conference"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="divisionId">
						{(field) => (
							<div className="space-y-2">
								<DivisionLookup
									value={field.state.value}
									onChange={field.handleChange}
									label="Division"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Academics Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Academics</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="average_gpa">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="average_gpa">Average GPA</Label>
								<Input
									id="average_gpa"
									type="number"
									step="0.01"
									min="0"
									max="5"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="3.85"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="sat_ebrw_25th">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="sat_ebrw_25th">SAT EBRW 25th</Label>
								<Input
									id="sat_ebrw_25th"
									type="number"
									min="200"
									max="800"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="680"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="sat_ebrw_75th">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="sat_ebrw_75th">SAT EBRW 75th</Label>
								<Input
									id="sat_ebrw_75th"
									type="number"
									min="200"
									max="800"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="770"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="sat_math_25th">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="sat_math_25th">SAT Math 25th</Label>
								<Input
									id="sat_math_25th"
									type="number"
									min="200"
									max="800"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="690"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="sat_math_75th">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="sat_math_75th">SAT Math 75th</Label>
								<Input
									id="sat_math_75th"
									type="number"
									min="200"
									max="800"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="790"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="act_composite_25th">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="act_composite_25th">ACT Composite 25th</Label>
								<Input
									id="act_composite_25th"
									type="number"
									min="1"
									max="36"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="32"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="act_composite_75th">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="act_composite_75th">ACT Composite 75th</Label>
								<Input
									id="act_composite_75th"
									type="number"
									min="1"
									max="36"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="35"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="acceptance_rate_pct">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="acceptance_rate_pct">Acceptance Rate (%)</Label>
								<Input
									id="acceptance_rate_pct"
									type="number"
									step="0.1"
									min="0"
									max="100"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="4.3"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="total_yearly_cost">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="total_yearly_cost">Total Yearly Cost</Label>
								<Input
									id="total_yearly_cost"
									type="number"
									min="0"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="75000"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="majors_offered_url">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="majors_offered_url">Majors Offered URL</Label>
								<Input
									id="majors_offered_url"
									type="url"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://university.edu/academics/majors"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="undergraduate_enrollment">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="undergraduate_enrollment">
									Undergraduate Enrollment
								</Label>
								<Input
									id="undergraduate_enrollment"
									type="number"
									min="0"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="7000"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Rankings & Identifiers Section */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Rankings & Identifiers</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="us_news_ranking_national_2018">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="us_news_ranking_national_2018">
									US News National Ranking (2018)
								</Label>
								<Input
									id="us_news_ranking_national_2018"
									type="number"
									min="1"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="5"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="us_news_ranking_liberal_arts_2018">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="us_news_ranking_liberal_arts_2018">
									US News Liberal Arts Ranking (2018)
								</Label>
								<Input
									id="us_news_ranking_liberal_arts_2018"
									type="number"
									min="1"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="1"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="ipeds_nces_id">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="ipeds_nces_id">IPEDS NCES ID</Label>
								<Input
									id="ipeds_nces_id"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="243744"
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
					{mode === "create" ? "Create University" : "Update University"}
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
