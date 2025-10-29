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

import { createClientAction } from "@/features/clients/actions/createClient";
import { updateClientAction } from "@/features/clients/actions/updateClient";
import {
	useBillingStatuses,
	useOnboardingStatuses,
} from "@/features/clients/queries/useClients";
import {
	type ClientEditFormInput,
	type ClientFormInput,
	clientEditFormSchema,
	clientFormSchema,
	getAllValidationErrors,
	validateSingleField,
	validationUtils,
} from "@/features/clients/types/client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface ClientFormProps {
	mode: "create" | "edit";
	initialData?: ClientEditFormInput;
	onSuccess?: () => void;
}

// Using enhanced validation utilities from types/client.ts

export default function ClientForm({
	mode,
	initialData,
	onSuccess,
}: ClientFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: billingStatuses = [] } = useBillingStatuses();
	const { data: onboardingStatuses = [] } = useOnboardingStatuses();

	const isEditMode = mode === "edit";
	const schema = isEditMode ? clientEditFormSchema : clientFormSchema;

	const form = useForm({
		defaultValues:
			isEditMode && initialData
				? {
						id: initialData.id,
						client_name: initialData.client_name || "",
						email: initialData.email || "",
						first_name: initialData.first_name || "",
						last_name: initialData.last_name || "",
						billing_status_id: initialData.billing_status_id || "none",
						onboarding_status_id: initialData.onboarding_status_id || "none",
					}
				: {
						client_name: "",
						email: "",
						first_name: "",
						last_name: "",
						billing_status_id: "none",
						onboarding_status_id: "none",
					},
		onSubmit: async ({ value }) => {
			console.log("Form onSubmit triggered - value:", value);
			setIsLoading(true);

			try {
				let result;

				// Convert "none" status IDs to undefined for the API
				const submissionValue = {
					...value,
					billing_status_id:
						value.billing_status_id === "none"
							? undefined
							: value.billing_status_id,
					onboarding_status_id:
						value.onboarding_status_id === "none"
							? undefined
							: value.onboarding_status_id,
				};

				if (isEditMode) {
					result = await updateClientAction(
						submissionValue as ClientEditFormInput,
					);
				} else {
					result = await createClientAction(submissionValue as ClientFormInput);
				}

				if (result?.data?.success) {
					toast.success(
						isEditMode
							? "Client updated successfully!"
							: "Client created successfully!",
					);

					// Invalidate queries
					queryClient.invalidateQueries({ queryKey: ["clients"] });
					if (isEditMode && initialData?.id) {
						queryClient.invalidateQueries({
							queryKey: ["client", initialData.id],
						});
					}

					if (onSuccess) {
						onSuccess();
					} else {
						// Navigate to client details page after creation, back for edits
						if (!isEditMode && result?.data?.data?.client?.id) {
							router.push(`/dashboard/clients/${result.data.data.client.id}`);
						} else {
							router.back();
						}
					}
				} else if (result?.validationErrors) {
					// Handle validation errors - show exact error messages
					const allErrors = getAllValidationErrors(result.validationErrors);
					if (allErrors.length > 0) {
						// Show the first error in toast, or combine multiple if they're short
						if (allErrors.length === 1) {
							toast.error(allErrors[0]);
						} else if (allErrors.join(", ").length < 100) {
							toast.error(allErrors.join(", "));
						} else {
							toast.error(
								`${allErrors[0]} (+${allErrors.length - 1} more errors)`,
							);
						}
					} else {
						toast.error("Please check your input and try again.");
					}
				}
			} catch (error) {
				console.error("Form submission error:", error);
				toast.error("An unexpected error occurred. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		// validators: {
		// 	onSubmit: async ({ value }) => {
		// 		console.log("Form validation - value:", value);
		// 		const validation = schema.safeParse(value);
		// 		console.log("Form validation - result:", validation);
		// 		if (!validation.success) {
		// 			const errors: Record<string, string> = {};
		// 			validation.error.issues.forEach((issue: any) => {
		// 				if (issue.path[0]) {
		// 					errors[issue.path[0] as string] = issue.message;
		// 				}
		// 			});
		// 			console.log("Form validation - errors:", errors);
		// 			return errors;
		// 		}
		// 		return undefined;
		// 	},
		// },
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Basic Information */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Basic Information</h3>

				<form.Field
					name="client_name"
					validators={{
						onBlur: ({ value }) =>
							validateSingleField(value, validationUtils.clientName),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Client Name (Organization) *</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="Enter client/organization name"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								required
							/>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0] || "")}
									</p>
								)}
						</div>
					)}
				</form.Field>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field
						name="first_name"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(value, validationUtils.name),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>First Name *</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter first name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="last_name"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(value, validationUtils.name),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Last Name *</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter last name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>

				<form.Field
					name="email"
					validators={{
						onChange: ({ value }) => {
							if (value && value.length > 5) {
								return validateSingleField(value, validationUtils.email);
							}
							return undefined;
						},
						onBlur: ({ value }) =>
							validateSingleField(value, validationUtils.email),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Email *</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								placeholder="Enter email address"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								required
							/>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0] || "")}
									</p>
								)}
						</div>
					)}
				</form.Field>
			</div>

			{/* Status Information */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Status Information</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="billing_status_id">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Billing Status</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select billing status (optional)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">No status</SelectItem>
										{billingStatuses.map((status: any) => (
											<SelectItem key={status.id} value={status.id}>
												{status.status_name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field name="onboarding_status_id">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Onboarding Status</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select onboarding status (optional)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">No status</SelectItem>
										{onboardingStatuses.map((status: any) => (
											<SelectItem key={status.id} value={status.id}>
												{status.status_name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Form Actions */}
			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<form.Subscribe>
					{(state) => (
						<Button type="submit" disabled={state.isSubmitting || isLoading}>
							{(state.isSubmitting || isLoading) && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{isEditMode ? "Update Client" : "Create Client"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
