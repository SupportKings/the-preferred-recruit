import Link from "next/link";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { EditIcon } from "lucide-react";

interface ClientDetailHeaderProps {
	clientId: string;
	clientName?: string;
}

export default function ClientDetailHeader({
	clientId,
	clientName,
}: ClientDetailHeaderProps) {
	return (
		<div className="sticky top-0 z-10 flex h-[45px] shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{clientName ? `${clientName} - Details` : "Client Details"}
				</h1>
			</div>
			<Button asChild>
				<Link
					href={`/dashboard/clients/${clientId}/edit`}
					className="flex items-center gap-2"
				>
					<EditIcon className="mr-1.5 h-4 w-4" />
					Edit Client
				</Link>
			</Button>
		</div>
	);
}
