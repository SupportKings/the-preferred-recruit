"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import RemoveUserDialog from "@/features/team/components/remove-user-dialog";
import { UserRow } from "@/features/team/components/user-row";
import type { UserWithRole } from "@/features/team/queries/getUsers";
import { useUsers } from "@/features/team/queries/useUsers";

function TeamSkeleton() {
	return (
		<div className="h-screen">
			<div className="flex flex-col">
				{Array.from({ length: 5 }).map((_, userIdx) => (
					<div
						key={`user-${userIdx}`}
						className="flex h-9 items-center justify-between border-b bg-card px-4"
					>
						<div className="flex items-center space-x-4">
							{/* Avatar Skeleton */}
							<Skeleton className="h-6 w-6 rounded-full" />

							{/* Name Skeleton */}
							<div className="flex items-center space-x-2">
								<Skeleton className="h-4 w-24" />
							</div>

							{/* Email and Join Date Skeleton */}
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-1">
									<Skeleton className="h-3 w-3" />
									<Skeleton className="h-3 w-32" />
								</div>
								<div className="flex items-center space-x-1">
									<Skeleton className="h-3 w-3" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
						</div>

						{/* Menu Button Skeleton */}
						<Skeleton className="h-6 w-6" />
					</div>
				))}
			</div>
		</div>
	);
}

interface TeamClientProps {
	currentUserId: string;
}

export default function TeamClient({ currentUserId }: TeamClientProps) {
	const { data, isLoading } = useUsers(false);
	const users: UserWithRole[] = data?.users || [];

	const [removeUserDialog, setRemoveUserDialog] = useState<{
		open: boolean;
		userId: string;
		userName: string;
	}>({ open: false, userId: "", userName: "" });

	const handleRemoveUser = (userId: string, userName: string) => {
		setRemoveUserDialog({
			open: true,
			userId,
			userName,
		});
	};

	if (isLoading) {
		return <TeamSkeleton />;
	}

	return (
		<>
			<div className="h-screen">
				<div className="flex flex-col">
					{users.map((user) => (
						<UserRow
							key={user.id}
							user={user}
							onRemoveUser={handleRemoveUser}
							currentUserId={currentUserId}
						/>
					))}
				</div>
			</div>

			<RemoveUserDialog
				open={removeUserDialog.open}
				onOpenChange={(open) =>
					setRemoveUserDialog((prev) => ({ ...prev, open }))
				}
				userId={removeUserDialog.userId}
				userName={removeUserDialog.userName}
			/>
		</>
	);
}
