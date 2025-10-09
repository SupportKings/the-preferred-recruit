"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

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

import { useAthletes } from "@/features/athletes/queries/useAthletes";
import { useUniversities } from "@/features/universities/queries/useUniversities";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createAthleteApplicationAction } from "../actions/createAthleteApplication";
import {
	APPLICATION_STAGES,
	type AthleteApplicationFormData,
	getAllValidationErrors,
	STAGE_LABELS,
} from "../types/athleteApplication";

interface Program {
	id: string;
	gender: "men" | "women" | null;
	team_url: string | null;
	university_id: string | null;
}

interface AthleteApplicationFormProps {
	mode?: "create" | "edit";
	initialData?: Partial<AthleteApplicationFormData>;
	onSuccess?: () => void;
}

export function AthleteApplicationForm({
	initialData,
	onSuccess,
}: AthleteApplicationFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Dropdown states
	const [athleteOpen, setAthleteOpen] = useState(false);
	const [universityOpen, setUniversityOpen] = useState(false);
	const [programOpen, setProgramOpen] = useState(false);
	const [stageOpen, setStageOpen] = useState(false);

	// Programs state
	const [programs, setPrograms] = useState<Program[]>([]);
	const [loadingPrograms, setLoadingPrograms] = useState(false);

	// Fetch athletes and universities
	const { data: athletes = [] } = useAthletes();
	const { data: universities = [] } = useUniversities();

	const { execute } = useAction(createAthleteApplicationAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success("Application created successfully");
				queryClient.invalidateQueries({ queryKey: ["athlete-applications"] });
				queryClient.invalidateQueries({ queryKey: ["applications"] });

				if (onSuccess) {
					onSuccess();
				} else {
					router.push("/dashboard/athlete-applications");
				}
			} else if (result.data?.validationErrors) {
				const validationErrors = result.data.validationErrors;
				const errors = getAllValidationErrors({
					program_id: validationErrors.program_id || { _errors: [] },
					athlete_id: validationErrors.athlete_id || { _errors: [] },
				});
				for (const error of errors) {
					toast.error(error);
				}
			} else if (result.data?.error) {
				toast.error(result.data.error);
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to create application");
		},
	});

	const form = useForm({
		defaultValues: {
			athlete_id: initialData?.athlete_id || "",
			university_id: initialData?.university_id || "",
			program_id: initialData?.program_id || "",
			stage: initialData?.stage || "",
			start_date: initialData?.start_date || "",
			offer_date: initialData?.offer_date || "",
			commitment_date: initialData?.commitment_date || "",
			last_interaction_at: initialData?.last_interaction_at || "",
			scholarship_amount_per_year:
				initialData?.scholarship_amount_per_year || "",
			scholarship_percent: initialData?.scholarship_percent || "",
			offer_notes: initialData?.offer_notes || "",
			internal_notes: initialData?.internal_notes || "",
		} satisfies AthleteApplicationFormData,
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				// Transform form data to match schema
				const transformedData = {
					athlete_id: value.athlete_id || undefined,
					university_id: value.university_id || undefined,
					program_id: value.program_id || undefined,
					stage: value.stage as "" | "intro" | "ongoing" | "visit" | "offer" | "committed" | "dropped" | undefined,
					start_date: value.start_date || undefined,
					offer_date: value.offer_date || undefined,
					commitment_date: value.commitment_date || undefined,
					last_interaction_at: value.last_interaction_at || undefined,
					scholarship_amount_per_year: value.scholarship_amount_per_year
						? Number.parseFloat(value.scholarship_amount_per_year)
						: undefined,
					scholarship_percent: value.scholarship_percent
						? Number.parseFloat(value.scholarship_percent)
						: undefined,
					offer_notes: value.offer_notes || undefined,
					internal_notes: value.internal_notes || undefined,
				};

				execute(transformedData);
			} catch (error) {
				console.error("Form submission error:", error);
				toast.error("Failed to submit form");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	// Track university ID for fetching programs
	const [currentUniversityId, setCurrentUniversityId] = useState<string>("");

	// Fetch programs when university changes
	useEffect(() => {
		if (currentUniversityId) {
			setLoadingPrograms(true);
			const supabase = createClient();
			(supabase as any)
				.from("programs")
				.select("id, gender, team_url, university_id")
				.eq("university_id", currentUniversityId)
				.eq("is_deleted", false)
				.then(({ data, error }: { data: Program[]; error: unknown }) => {
					if (error) {
						console.error("Error fetching programs:", error);
						toast.error("Failed to load programs");
					} else {
						setPrograms(data || []);
					}
					setLoadingPrograms(false);
				});
		} else {
			setPrograms([]);
			// Clear program_id if university is cleared
			const programId = form.getFieldValue("program_id");
			if (programId) {
				form.setFieldValue("program_id", "");
			}
		}
	}, [currentUniversityId, form]);

	const selectedAthlete = athletes.find(
		(a: { id: string }) => a.id === form.getFieldValue("athlete_id"),
	);
	const selectedUniversity = universities.find(
		(u) => u.id === form.getFieldValue("university_id"),
	);
	const selectedProgram = programs.find(
		(p) => p.id === form.getFieldValue("program_id"),
	);
	const selectedStage = form.getFieldValue("stage");

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-8"
		>
			{/* Core Section */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Core Information</h3>

				{/* Athlete */}
				<form.Field name="athlete_id">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="athlete_id">Athlete</Label>
							<Popover open={athleteOpen} onOpenChange={setAthleteOpen}>
								<PopoverTrigger asChild>
									<Button
										id="athlete_id"
										variant="outline"
										className="w-full justify-between"
										type="button"
									>
										{selectedAthlete
											? `${selectedAthlete.full_name}${selectedAthlete.graduation_year ? ` (${selectedAthlete.graduation_year})` : ""}`
											: "Select athlete..."}
										<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start">
									<Command>
										<CommandInput placeholder="Search athletes..." />
										<CommandList>
											<CommandEmpty>No athlete found.</CommandEmpty>
											<CommandGroup>
												{athletes.map((athlete: { id: string; full_name: string; graduation_year: number | null }) => (
													<CommandItem
														key={athlete.id}
														value={`${athlete.full_name} ${athlete.graduation_year || ""}`}
														onSelect={() => {
															field.handleChange(athlete.id);
															setAthleteOpen(false);
														}}
													>
														<Check
															className={`mr-2 size-4 ${
																field.state.value === athlete.id
																	? "opacity-100"
																	: "opacity-0"
															}`}
														/>
														{athlete.full_name}
														{athlete.graduation_year &&
															` (${athlete.graduation_year})`}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					)}
				</form.Field>

				{/* University */}
				<form.Field name="university_id">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="university_id">University</Label>
							<Popover open={universityOpen} onOpenChange={setUniversityOpen}>
								<PopoverTrigger asChild>
									<Button
										id="university_id"
										variant="outline"
										className="w-full justify-between"
										type="button"
									>
										{selectedUniversity
											? `${selectedUniversity.name}${selectedUniversity.state ? `, ${selectedUniversity.state}` : ""}`
											: "Select university..."}
										<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start">
									<Command>
										<CommandInput placeholder="Search universities..." />
										<CommandList>
											<CommandEmpty>No university found.</CommandEmpty>
											<CommandGroup>
												{universities.map((university) => (
													<CommandItem
														key={university.id}
														value={`${university.name || ""} ${university.state || ""}`}
														onSelect={() => {
															field.handleChange(university.id);
															setCurrentUniversityId(university.id);
															setUniversityOpen(false);
														}}
													>
														<Check
															className={`mr-2 size-4 ${
																field.state.value === university.id
																	? "opacity-100"
																	: "opacity-0"
															}`}
														/>
														{university.name}
														{university.state && `, ${university.state}`}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					)}
				</form.Field>

				{/* Program */}
				<form.Field name="program_id">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="program_id">
								Program{" "}
								{form.getFieldValue("university_id") &&
									"(must belong to selected university)"}
							</Label>
							<Popover open={programOpen} onOpenChange={setProgramOpen}>
								<PopoverTrigger asChild>
									<Button
										id="program_id"
										variant="outline"
										className="w-full justify-between"
										type="button"
										disabled={!form.getFieldValue("university_id")}
									>
										{loadingPrograms ? (
											<>
												<Loader2 className="mr-2 size-4 animate-spin" />
												Loading programs...
											</>
										) : selectedProgram ? (
											`${selectedProgram.gender ? `${selectedProgram.gender.charAt(0).toUpperCase() + selectedProgram.gender.slice(1)}'s` : "Program"}`
										) : (
											"Select program..."
										)}
										<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start">
									<Command>
										<CommandInput placeholder="Search programs..." />
										<CommandList>
											<CommandEmpty>
												{form.getFieldValue("university_id")
													? "No programs found for this university."
													: "Please select a university first."}
											</CommandEmpty>
											<CommandGroup>
												{programs.map((program) => (
													<CommandItem
														key={program.id}
														value={`${program.gender || ""} ${program.team_url || ""}`}
														onSelect={() => {
															field.handleChange(program.id);
															setProgramOpen(false);
														}}
													>
														<Check
															className={`mr-2 size-4 ${
																field.state.value === program.id
																	? "opacity-100"
																	: "opacity-0"
															}`}
														/>
														{program.gender
															? `${program.gender.charAt(0).toUpperCase() + program.gender.slice(1)}'s Program`
															: "Program"}
														{program.team_url && ` - ${program.team_url}`}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							<p className="text-muted-foreground text-sm">
								Gender: {selectedProgram?.gender || "N/A"}
								{selectedProgram?.team_url && (
									<>
										{" | "}
										<a
											href={selectedProgram.team_url}
											target="_blank"
											rel="noopener noreferrer"
											className="underline hover:text-primary"
										>
											Team URL
										</a>
									</>
								)}
							</p>
						</div>
					)}
				</form.Field>

				{/* Stage */}
				<form.Field name="stage">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="stage">Stage</Label>
							<Popover open={stageOpen} onOpenChange={setStageOpen}>
								<PopoverTrigger asChild>
									<Button
										id="stage"
										variant="outline"
										className="w-full justify-between"
										type="button"
									>
										{selectedStage
											? STAGE_LABELS[selectedStage as keyof typeof STAGE_LABELS]
											: "Select stage..."}
										<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start">
									<Command>
										<CommandList>
											<CommandGroup>
												{APPLICATION_STAGES.map((stage) => (
													<CommandItem
														key={stage}
														value={stage}
														onSelect={() => {
															field.handleChange(stage);
															setStageOpen(false);
														}}
													>
														<Check
															className={`mr-2 size-4 ${
																field.state.value === stage
																	? "opacity-100"
																	: "opacity-0"
															}`}
														/>
														{STAGE_LABELS[stage]}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					)}
				</form.Field>
			</div>

			{/* Timeline Section */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Timeline</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
							</div>
						)}
					</form.Field>

					<form.Field name="offer_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="offer_date">Offer Date</Label>
								<DatePicker
									id="offer_date"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select offer date"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="commitment_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="commitment_date">Commitment Date</Label>
								<DatePicker
									id="commitment_date"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select commitment date"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="last_interaction_at">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="last_interaction_at">Last Interaction</Label>
								<DatePicker
									id="last_interaction_at"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select last interaction date"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Scholarship Section */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Scholarship</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="scholarship_amount_per_year">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="scholarship_amount_per_year">
									Scholarship Amount (USD/year)
								</Label>
								<Input
									id="scholarship_amount_per_year"
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="scholarship_percent">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="scholarship_percent">
									Scholarship Percent (%)
								</Label>
								<Input
									id="scholarship_percent"
									type="number"
									step="0.01"
									min="0"
									max="100"
									placeholder="0.00"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Notes Section */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Notes</h3>
				<form.Field name="offer_notes">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="offer_notes">Offer Notes</Label>
							<Textarea
								id="offer_notes"
								rows={4}
								placeholder="Enter offer notes..."
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="internal_notes">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="internal_notes">Internal Notes</Label>
							<Textarea
								id="internal_notes"
								rows={4}
								placeholder="Enter internal notes..."
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				</form.Field>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-4">
				<Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Creating...
						</>
					) : (
						"Create Application"
					)}
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
