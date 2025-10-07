"use client";

import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createCoachAction } from "../actions/createCoach";
import {
	EVENT_GROUP_LABELS,
	EVENT_GROUPS,
	getAllValidationErrors,
	type CoachFormInput,
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

	const { execute } = useAction(createCoachAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success("Coach created successfully");
				queryClient.invalidateQueries({ queryKey: ["coaches"] });

				if (onSuccess) {
					onSuccess();
				} else {
					router.push("/dashboard/coaches");
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
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
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
