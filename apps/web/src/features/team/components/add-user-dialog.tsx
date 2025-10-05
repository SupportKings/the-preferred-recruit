"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { addUser } from "@/features/team/actions/addUser";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
	email: z.string().email("Invalid email address"),
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
});

export default function AddUserDialog() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			email: "",
			first_name: "",
			last_name: "",
		},
		onSubmit: async ({ value }) => {
			const result = await addUser({
				email: value.email,
				first_name: value.first_name,
				last_name: value.last_name,
			});

			if (result?.data?.success) {
				toast.success("User created successfully!");
				setOpen(false);
				form.reset();
				// Invalidate and refetch users data
				queryClient.invalidateQueries({ queryKey: ["users", false] });
			} else if (result?.validationErrors?._errors) {
				// Handle server validation errors
				const errorMessage =
					result.validationErrors._errors[0] || "Failed to create user";
				toast.error(errorMessage);

				// Only log unexpected errors, not expected validation errors like "user already exists"
				const isExpectedError =
					errorMessage.toLowerCase().includes("already exists") ||
					errorMessage.toLowerCase().includes("user already exists");
				if (!isExpectedError) {
					console.error(
						"Server validation errors:",
						result.validationErrors._errors,
					);
				}
			}
		},
		validators: {
			onSubmit: userSchema,
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add User
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New User</DialogTitle>
					<DialogDescription>
						Create a new user account. Once added, they can immediately sign in
						with their email - no invitation or acceptance required.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="first_name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>First Name</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter first name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<form.Field name="last_name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Last Name</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter last name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
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
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={form.state.isSubmitting}
						>
							Cancel
						</Button>
						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Create User
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
