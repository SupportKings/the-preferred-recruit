"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { updateAthleteAction } from "@/features/athletes/actions/updateAthlete";
import { athleteQueries } from "@/features/athletes/queries/useAthletes";

import { useQueryClient } from "@tanstack/react-query";
import { Mail, Pencil } from "lucide-react";
import { toast } from "sonner";
import { SendingEmailLookup } from "../lookups/sending-email-lookup";

interface ManageSendingEmailModalProps {
	athleteId: string;
	currentSendingEmailId?: string | null;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageSendingEmailModal({
	athleteId,
	currentSendingEmailId,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageSendingEmailModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [sendingEmailId, setSendingEmailId] = useState<string>(
		currentSendingEmailId || "",
	);

	useEffect(() => {
		if (open) {
			setSendingEmailId(currentSendingEmailId || "");
		}
	}, [currentSendingEmailId, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			const result = await updateAthleteAction({
				id: athleteId,
				sending_email_id: sendingEmailId || undefined,
			});

			if (result?.validationErrors) {
				const errorMessages: string[] = [];

				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}

				Object.entries(result.validationErrors).forEach(([field, errors]) => {
					if (field !== "_errors" && errors) {
						const fieldName = field
							.replace(/_/g, " ")
							.replace(/\b\w/g, (l) => l.toUpperCase());

						if (Array.isArray(errors)) {
							errorMessages.push(
								...errors.map((error) => `${fieldName}: ${error}`),
							);
						} else if (
							errors &&
							typeof errors === "object" &&
							"_errors" in errors &&
							Array.isArray(errors._errors)
						) {
							errorMessages.push(
								...errors._errors.map(
									(error: string) => `${fieldName}: ${error}`,
								),
							);
						}
					}
				});

				if (errorMessages.length > 0) {
					for (const error of errorMessages) {
						toast.error(error);
					}
				} else {
					toast.error("Failed to update sending email");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success(
					sendingEmailId
						? "Sending email account assigned successfully!"
						: "Sending email account removed successfully!",
				);

				await queryClient.invalidateQueries({
					queryKey: athleteQueries.detail(athleteId),
				});

				setOpen(false);
			} else {
				toast.error("Failed to update sending email");
			}
		} catch (error) {
			console.error("Error updating sending email:", error);
			toast.error("Failed to update sending email");
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
							<Pencil className="h-4 w-4" />
							{currentSendingEmailId ? "Change" : "Assign"} Email Account
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						{currentSendingEmailId
							? "Change Sending Email Account"
							: "Assign Sending Email Account"}
					</DialogTitle>
					<DialogDescription>
						{currentSendingEmailId
							? "Select a different sending email account for this athlete or clear the assignment."
							: "Select a sending email account to assign to this athlete."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<SendingEmailLookup
						value={sendingEmailId}
						onChange={setSendingEmailId}
						label="Sending Email Account"
						allowClear={true}
					/>

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
								? "Updating..."
								: sendingEmailId
									? "Assign Account"
									: "Clear Assignment"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
