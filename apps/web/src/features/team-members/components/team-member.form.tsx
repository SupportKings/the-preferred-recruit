"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createTeamMemberAction } from "../actions/createTeamMember";
import {
	getAllValidationErrors,
	type TeamMemberFormInput,
	teamMemberFormSchema,
	US_TIMEZONES,
} from "../types/team-member";

interface TeamMemberFormProps {
	mode?: "create" | "edit";
	initialData?: Partial<TeamMemberFormInput>;
	onSuccess?: () => void;
}

export function TeamMemberForm({
	mode = "create",
	initialData,
	onSuccess,
}: TeamMemberFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { execute } = useAction(createTeamMemberAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success(result.data.success);
				queryClient.invalidateQueries({ queryKey: ["team-members"] });

				if (onSuccess) {
					onSuccess();
				} else {
					// Navigate to team member details page
					const teamMemberId = result.data?.teamMember?.id;
					if (teamMemberId) {
						router.push(`/dashboard/team-members/${teamMemberId}`);
					} else {
						router.push("/dashboard/team-members");
					}
				}
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to create team member");
		},
	});

	const form = useForm({
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || "",
			job_title: initialData?.job_title || "",
			timezone: initialData?.timezone || "",
			internal_notes: initialData?.internal_notes || "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				// Validate with Zod schema
				const result = teamMemberFormSchema.safeParse(value);

				if (!result.success) {
					const errors = getAllValidationErrors(
						result.error.flatten().fieldErrors,
					);
					for (const error of errors) {
						toast.error(error);
					}
					setIsSubmitting(false);
					return;
				}

				// Execute the action
				execute(result.data);
			} catch (error) {
				console.error("Form submission error:", error);
				toast.error("An unexpected error occurred");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<form
			className="space-y-8"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			{/* Identity Section */}
			<div className="space-y-4">
				<div>
					<h2 className="font-medium text-base">Identity</h2>
					<p className="text-muted-foreground text-sm">
						Basic information about the team member
					</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					{/* Full Name */}
					<form.Field
						name="name"
						validators={{
							onBlur: ({ value }) => {
								if (!value || value.trim().length === 0) {
									return "Name is required";
								}
								if (value.trim().length < 2) {
									return "Name must be at least 2 characters";
								}
								if (value.trim().length > 100) {
									return "Name must be less than 100 characters";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Full Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
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

					{/* Email */}
					<form.Field
						name="email"
						validators={{
							onBlur: ({ value }) => {
								if (!value || value.trim().length === 0) {
									return "Email is required";
								}
								// Basic email validation
								const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
								if (!emailRegex.test(value)) {
									return "Invalid email address";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Email <span className="text-destructive">*</span>
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="john.doe@example.com"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
								<p className="text-muted-foreground text-xs">
									An invitation email will be sent to this address
								</p>
							</div>
						)}
					</form.Field>

					{/* Job Title */}
					<form.Field name="job_title">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Job Title</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Recruiting Coordinator"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					{/* Timezone */}
					<form.Field name="timezone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Timezone</Label>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger id={field.name}>
										<SelectValue placeholder="Select timezone" />
									</SelectTrigger>
									<SelectContent>
										{US_TIMEZONES.map((tz) => (
											<SelectItem key={tz.value} value={tz.value}>
												{tz.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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

			{/* Internal Notes Section */}
			<div className="space-y-4">
				<div>
					<h2 className="font-medium text-base">Internal</h2>
					<p className="text-muted-foreground text-sm">
						Notes for internal use only
					</p>
				</div>

				<form.Field name="internal_notes">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Internal Notes</Label>
							<Textarea
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Any internal notes about this team member..."
								rows={4}
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

			{/* Form Actions */}
			<div className="flex items-center gap-2">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "create" ? "Create Team Member" : "Update Team Member"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/dashboard/team-members")}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
