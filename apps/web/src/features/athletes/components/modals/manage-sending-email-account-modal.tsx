"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";

import {
	createDomain,
	createSendingEmail,
	updateSendingEmail,
} from "@/features/athletes/actions/sendingEmails";
import { updateAthleteAction } from "@/features/athletes/actions/updateAthlete";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { DomainLookupWithCreate } from "../lookups/domain-lookup-with-create";

interface ManageSendingEmailAccountModalProps {
	athleteId: string;
	mode: "create" | "edit";
	currentSendingEmail?: {
		id: string;
		username: string | null;
		name: string | null;
		domain_id: string | null;
		internal_notes: string | null;
		is_primary?: boolean;
		domain?: {
			id: string;
			domain_url: string | null;
		} | null;
	};
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void | Promise<void>;
}

export function ManageSendingEmailAccountModal({
	athleteId,
	mode,
	currentSendingEmail,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
	onSuccess,
}: ManageSendingEmailAccountModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		username: "",
		name: "",
		domain_id: "",
		internal_notes: "",
	});

	const [setAsPrimary, setSetAsPrimary] = useState(true); // Default to true for new accounts

	const [pendingDomain, setPendingDomain] = useState<{
		id: string;
		domain_url: string;
	} | null>(null);

	const [selectedDomainUrl, setSelectedDomainUrl] = useState<string>("");

	useEffect(() => {
		if (isEdit && currentSendingEmail && open) {
			setFormData({
				username: currentSendingEmail.username || "",
				name: currentSendingEmail.name || "",
				domain_id: currentSendingEmail.domain_id || "",
				internal_notes: currentSendingEmail.internal_notes || "",
			});

			// Pre-populate domain URL for preview
			if (currentSendingEmail.domain?.domain_url) {
				setSelectedDomainUrl(currentSendingEmail.domain.domain_url);
			}
		} else if (!isEdit && open) {
			setFormData({
				username: "",
				name: "",
				domain_id: "",
				internal_notes: "",
			});
			setSetAsPrimary(true); // Reset to default
			setPendingDomain(null);
			setSelectedDomainUrl("");
		}
	}, [isEdit, currentSendingEmail, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.username) {
			toast.error("Username is required");
			return;
		}

		if (!formData.domain_id) {
			toast.error("Domain is required");
			return;
		}

		setIsLoading(true);

		try {
			// Step 1: Create the domain if it's pending
			let finalDomainId = formData.domain_id;

			if (pendingDomain) {
				const domainResult = await createDomain({
					domain_url: pendingDomain.domain_url,
					athlete_id: athleteId,
				});

				if (domainResult?.validationErrors) {
					const isDuplicateError =
						domainResult.validationErrors.domain_url?._errors?.some(
							(err: string) => err.includes("already exists"),
						);

					if (isDuplicateError) {
						toast.error(
							"This domain already exists. Please select it from the dropdown instead of creating a new one.",
						);
						setIsLoading(false);
						return;
					}

					const errorMessages: string[] = [];
					if (domainResult.validationErrors._errors) {
						errorMessages.push(...domainResult.validationErrors._errors);
					}
					Object.entries(domainResult.validationErrors).forEach(
						([field, errors]) => {
							if (field !== "_errors" && errors) {
								if (Array.isArray(errors)) {
									errorMessages.push(...errors);
								} else if (
									errors &&
									typeof errors === "object" &&
									"_errors" in errors
								) {
									errorMessages.push(...(errors._errors as string[]));
								}
							}
						},
					);

					if (errorMessages.length > 0) {
						for (const error of errorMessages) {
							toast.error(error);
						}
					} else {
						toast.error("Failed to create domain");
					}
					setIsLoading(false);
					return;
				}

				if (domainResult?.serverError) {
					toast.error(`Server error: ${domainResult.serverError}`);
					setIsLoading(false);
					return;
				}

				if (!domainResult?.data?.domain) {
					toast.error("Failed to create domain - no response data");
					setIsLoading(false);
					return;
				}

				finalDomainId = domainResult.data.domain.id as string;
				toast.success("Domain created successfully!");
			}

			// Step 2: Create or update the sending email account
			let sendingEmailResult: Awaited<
				ReturnType<typeof createSendingEmail | typeof updateSendingEmail>
			>;

			if (isEdit && currentSendingEmail) {
				const updatePayload: {
					id: string;
					username: string;
					domain_id: string;
					name?: string;
					internal_notes?: string;
				} = {
					id: currentSendingEmail.id,
					username: formData.username,
					domain_id: finalDomainId,
				};

				if (formData.name && formData.name.trim() !== "") {
					updatePayload.name = formData.name;
				}
				if (formData.internal_notes && formData.internal_notes.trim() !== "") {
					updatePayload.internal_notes = formData.internal_notes;
				}

				sendingEmailResult = await updateSendingEmail(updatePayload);
			} else {
				const createPayload = {
					username: formData.username,
					domain_id: finalDomainId,
					name: formData.name || null,
					internal_notes: formData.internal_notes || null,
				};

				sendingEmailResult = await createSendingEmail(createPayload);
			}

			if (sendingEmailResult?.serverError) {
				toast.error(sendingEmailResult.serverError);
				setIsLoading(false);
				return;
			}

			if (!sendingEmailResult?.data) {
				toast.error(
					`Failed to ${isEdit ? "update" : "create"} sending email account`,
				);
				setIsLoading(false);
				return;
			}

			const newSendingEmailId = sendingEmailResult.data?.id;

			toast.success(
				`Sending email account ${isEdit ? "updated" : "created"} successfully!`,
			);

			// Step 3: If creating and "Set as Primary" is checked, assign it to the athlete
			if (!isEdit && setAsPrimary && newSendingEmailId) {
				const athleteUpdateResult = await updateAthleteAction({
					id: athleteId,
					sending_email_id: newSendingEmailId,
				});

				if (athleteUpdateResult?.data?.success) {
					toast.success("Set as primary email for this athlete!");
				} else {
					console.error("Failed to set as primary:", athleteUpdateResult);
					toast.error("Created email account but failed to set as primary");
				}
			}

			// Invalidate queries
			await queryClient.invalidateQueries({
				queryKey: athleteQueries.detail(athleteId),
			});

			// Call onSuccess callback
			if (onSuccess) {
				await onSuccess();
			}

			setOpen(false);
		} catch (error) {
			console.error("Error managing sending email account:", error);
			toast.error(
				`Failed to ${isEdit ? "update" : "create"} sending email account`,
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{externalOpen === undefined && (
				<DialogTrigger asChild>
					{children || (
						<Button variant="outline" size="sm" className="gap-2">
							<Plus className="h-4 w-4" />
							{isEdit ? "Edit" : "Create"} Email Account
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						{isEdit
							? "Edit Sending Email Account"
							: "Add Sending Email Account"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the sending email account details."
							: "Add a new sending email account for this athlete."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Username */}
					<div className="space-y-2">
						<Label htmlFor="username">Username *</Label>
						<Input
							id="username"
							placeholder="john.doe"
							value={formData.username}
							onChange={(e) =>
								setFormData({
									...formData,
									username: e.target.value.toLowerCase(),
								})
							}
							required
						/>
						<p className="text-muted-foreground text-xs">
							The part before @ in the email address
						</p>
					</div>

					{/* Domain */}
					<DomainLookupWithCreate
						value={formData.domain_id}
						onChange={(domainId, domainUrl) => {
							setFormData({ ...formData, domain_id: domainId });
							if (domainUrl) {
								setSelectedDomainUrl(domainUrl);

								if (domainId.startsWith("pending-")) {
									setPendingDomain({ id: domainId, domain_url: domainUrl });
								} else {
									setPendingDomain(null);
								}
							}
						}}
						label="Domain"
						required
						athleteId={athleteId}
						onDomainCreated={(domain) => {
							setPendingDomain(domain);
						}}
					/>

					{/* Preview */}
					{formData.username && formData.domain_id && (
						<div className="rounded-md border bg-muted p-3">
							<p className="text-muted-foreground text-xs">Email Preview:</p>
							<p className="font-medium text-sm">
								{formData.username}@{selectedDomainUrl || "..."}
							</p>
						</div>
					)}

					{/* Account Name */}
					<div className="space-y-2">
						<Label htmlFor="name">Account Name</Label>
						<Input
							id="name"
							placeholder="John's Personal Email"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
						/>
						<p className="text-muted-foreground text-xs">
							Friendly name for this email account
						</p>
					</div>

					{/* Internal Notes */}
					<div className="space-y-2">
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							placeholder="Private notes about this email account"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					{/* Set as Primary - only show on create */}
					{!isEdit && (
						<div className="flex items-center space-x-2 rounded-md border p-3">
							<Checkbox
								id="set-as-primary"
								checked={setAsPrimary}
								onCheckedChange={(checked) => setSetAsPrimary(checked === true)}
							/>
							<div className="grid gap-1.5 leading-none">
								<Label
									htmlFor="set-as-primary"
									className="cursor-pointer font-medium text-sm"
								>
									Set as primary email
								</Label>
								<p className="text-muted-foreground text-xs">
									This email will be used for sending campaigns
								</p>
							</div>
						</div>
					)}

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
									? "Update Account"
									: "Add Account"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
