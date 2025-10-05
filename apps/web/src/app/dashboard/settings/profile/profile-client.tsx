"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ProfilePicture } from "@/features/profile/components/profile-picture";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
});

interface ProfileFormProps {
	user: {
		name: string;
		email: string;
		image?: string | null;
	};
}

function ProfileSkeleton() {
	return (
		<div className="mt-12 flex justify-center">
			<section className="m-0 block w-full max-w-2xl rounded-[7px] border-[#dadbda] border-[0.5px] border-solid bg-white p-0 align-baseline empty:hidden dark:border-[#2d3036] dark:bg-[lch(8.3_1.867_272)]">
				<ul className="mx-0 mt-[0.8em] mb-[1.2em] border-0 p-0 align-baseline [list-style:none]">
					{/* Profile Picture Skeleton */}
					<li className="relative m-0 flex min-h-[60px] items-center justify-between gap-4 rounded-t-md border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
						<div className="wrap] m-0 flex min-w-0 grow gap-1 border-0 p-0 align-baseline opacity-100 [-webkit-box-flex:1] [flex-flow:column]">
							<Skeleton className="h-[13px] w-24" />
						</div>
						<div
							className="m-0 flex flex-row border-0 p-0 align-baseline"
							data-menu-open="false"
						>
							<Skeleton className="h-8 w-8 rounded-full" />
						</div>
					</li>

					{/* Divider */}
					<li className="mx-4 border-[#dadbda] border-b dark:border-[#2d3036]" />

					{/* Name Field Skeleton */}
					<li className="relative m-0 flex min-h-[60px] items-center justify-between gap-4 rounded-br-md rounded-bl-md border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
						<div className="m-0 flex min-w-0 flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
							<div className="wrap] m-0 flex min-w-0 grow gap-1 border-0 p-0 align-baseline opacity-100 [-webkit-box-flex:1] [flex-flow:column]">
								<div className="m-0 flex min-w-0 flex-row items-center gap-1 border-0 p-0 align-baseline [-webkit-box-align:center]">
									<Skeleton className="h-[13px] w-16" />
								</div>
							</div>
						</div>
						<Skeleton className="h-8 w-48 rounded-[5px]" />
					</li>
				</ul>

				{/* Save Button Skeleton */}
				<div className="flex justify-end px-4 pb-4">
					<Skeleton className="h-9 w-28" />
				</div>
			</section>
		</div>
	);
}

// Export a client wrapper that handles loading state
export { ProfileSkeleton };

export function ProfileForm({ user }: ProfileFormProps) {
	const [isUpdating, setIsUpdating] = useState(false);
	const router = useRouter();
	const form = useForm({
		defaultValues: {
			name: user.name || "",
		},
		onSubmit: async ({ value }) => {
			setIsUpdating(true);

			await authClient.updateUser(
				{
					name: value.name,
				},
				{
					onSuccess: () => {
						// You could add a toast notification here for success
						setTimeout(() => {
							router.refresh();
						}, 0);
						setIsUpdating(false);
					},
					onError: (error) => {
						console.error(
							"Error updating profile:",
							error.error.message || error.error,
						);
						// You could add a toast notification here for error
						setIsUpdating(false);
					},
				},
			);
		},
		validators: {
			onSubmit: profileSchema,
		},
	});

	return (
		<div className="mt-12 flex justify-center">
			<section className="m-0 block w-full max-w-2xl rounded-[7px] border-[#dadbda] border-[0.5px] border-solid bg-white p-0 align-baseline empty:hidden dark:border-[#2d3036] dark:bg-[lch(8.3_1.867_272)]">
				<ul className="mx-0 mt-[0.8em] mb-[1.2em] border-0 p-0 align-baseline [list-style:none]">
					{/* Profile Picture */}
					<li className="relative m-0 flex min-h-[60px] items-center justify-between gap-4 rounded-t-md border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
						<div className="wrap] m-0 flex min-w-0 grow gap-1 border-0 p-0 align-baseline opacity-100 [-webkit-box-flex:1] [flex-flow:column]">
							<span className="m-0 border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(9.821_0_282.863)] dark:text-[lch(100_0_272)]">
								Profile picture
							</span>
						</div>
						<div
							className="m-0 flex flex-row border-0 p-0 align-baseline"
							data-menu-open="false"
						>
							<ProfilePicture
								src={user.image}
								alt={`Avatar of ${user.name}`}
								size={32}
								userName={user.name}
							/>
						</div>
					</li>

					{/* Divider */}
					<li className="mx-4 border-[#dadbda] border-b dark:border-[#2d3036]" />

					{/* Name (Editable) */}
					<li className="relative m-0 flex min-h-[60px] items-center justify-between gap-4 rounded-br-md rounded-bl-md border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
						<div className="m-0 flex min-w-0 flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
							<div className="wrap] m-0 flex min-w-0 grow gap-1 border-0 p-0 align-baseline opacity-100 [-webkit-box-flex:1] [flex-flow:column]">
								<div className="m-0 flex min-w-0 flex-row items-center gap-1 border-0 p-0 align-baseline [-webkit-box-align:center]">
									<label
										className="m-0 break-words border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(9.821_0_282.863)] dark:text-[lch(100_0_272)]"
										htmlFor="name"
									>
										Full name
									</label>
								</div>
							</div>
						</div>
						<form.Field name="name">
							{(field) => (
								<input
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									className="-outline-offset-1 mx-0 my-0.5 h-8 appearance-none rounded-[5px] border-[#dadbda] border-[0.5px] border-solid bg-white px-3 py-1.5 text-[0.8125rem] text-[lch(9.821_0_282.863)] transition-[border] duration-[0.15s] [app-region:no-drag] [font-feature-settings:'calt'] placeholder:text-[lch(9.821_0_282.863)] focus:border-[lch(47.918_59.303_288.421)] focus:outline-none dark:border-[#2d3036] dark:bg-[lch(8.3_1.867_272)] dark:text-[lch(100_0_272)] dark:focus:border-[lch(47.918_59.303_288.421)] dark:placeholder:text-[lch(100_0_272)]"
									data-1p-ignore="true"
									autoComplete="off"
									placeholder="Full name"
									id="name"
								/>
							)}
						</form.Field>
					</li>
				</ul>

				{/* Save Button */}
				<div className="flex justify-end px-4 pb-4">
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								disabled={!state.canSubmit || isUpdating}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									void form.handleSubmit();
								}}
							>
								{isUpdating && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save Changes
							</Button>
						)}
					</form.Subscribe>
				</div>
			</section>
		</div>
	);
}
