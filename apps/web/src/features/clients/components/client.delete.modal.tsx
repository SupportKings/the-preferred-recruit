"use client";

import { useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";

import { Dialog } from "@base-ui-components/react/dialog";
import { LoaderIcon, Trash2Icon } from "lucide-react";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ClientDeleteModalProps {
	client: ClientRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
}

export function ClientDeleteModal({
	client,
	open,
	onOpenChange,
	onConfirm,
}: ClientDeleteModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		try {
			setIsDeleting(true);
			await onConfirm();
			onOpenChange(false);
		} catch (error) {
			console.error("Error deleting client:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70" />
				<Dialog.Popup className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-md rounded-lg border border-border bg-background shadow-lg">
					<div className="p-6">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
								<Trash2Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
							</div>
							<div>
								<Dialog.Title className="font-semibold text-foreground text-lg">
									Delete Client
								</Dialog.Title>
							</div>
						</div>

						<Dialog.Description className="mb-6 text-muted-foreground text-sm">
							Are you sure you want to delete{" "}
							<span className="font-medium text-foreground">
								{client.first_name} {client.last_name}
							</span>
							? This action cannot be undone and will remove all associated
							data.
						</Dialog.Description>

						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isDeleting}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleConfirm}
								disabled={isDeleting}
								className="gap-2"
							>
								{isDeleting ? (
									<>
										<LoaderIcon className="h-4 w-4 animate-spin" />
										Deleting...
									</>
								) : (
									<>
										<Trash2Icon className="h-4 w-4" />
										Delete Client
									</>
								)}
							</Button>
						</div>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
