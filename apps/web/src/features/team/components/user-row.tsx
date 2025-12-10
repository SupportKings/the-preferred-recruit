import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { UserWithRole } from "@/features/team/queries/getUsers";

import { formatLocalDate } from "@/lib/date-utils";
import { Mail, MoreHorizontal, User, XIcon } from "lucide-react";

interface UserRowProps {
	user: UserWithRole;
	onRemoveUser: (userId: string, userName: string) => void;
	currentUserId: string;
}

export function UserRow({ user, onRemoveUser, currentUserId }: UserRowProps) {
	// Check if user is the current user (self)
	const isSelf = currentUserId === user.id;

	// Check admin actions

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="flex h-9 items-center justify-between border-b bg-card px-4">
			<div className="flex items-center space-x-4">
				<Avatar className="h-6 w-6">
					<AvatarImage
						src={user.image || undefined}
						alt={user.name || "User"}
					/>
					<AvatarFallback className="text-xs">
						{getInitials(user.name || "User")}
					</AvatarFallback>
				</Avatar>

				<div className="flex items-center space-x-2">
					<p className="font-medium text-sm leading-none">
						{user.name || "Unknown User"}
					</p>
				</div>

				<div className="flex items-center space-x-4 text-muted-foreground text-sm">
					<div className="flex items-center space-x-1">
						<Mail className="h-3 w-3" />
						<span>{user.email}</span>
					</div>

					<div className="flex items-center space-x-1">
						<User className="h-3 w-3" />
						<span>Joined {formatLocalDate(user.createdAt, "MMM d, yyyy", "date unknown")}</span>
					</div>
				</div>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-6 w-6 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() => onRemoveUser(user.id, user.name || "Unknown User")}
					>
						<XIcon className="mr-[6px] h-4 w-4" />
						Remove from Team
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
