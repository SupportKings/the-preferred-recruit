import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { CommandBar } from "@/features/commandpallette/components/commandBar";
import { CommandProvider } from "@/features/commandpallette/components/commandProvider";

import { getUser } from "@/queries/getUser";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	return (
		<CommandProvider>
			<SidebarProvider>
				<AppSidebar variant="inset" session={session} />

				<SidebarInset className="overflow-x-hidden">
					{children}
					<CommandBar />
				</SidebarInset>
			</SidebarProvider>
		</CommandProvider>
	);
}
