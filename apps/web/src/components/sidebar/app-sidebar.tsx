"use client";

import type * as React from "react";

import { usePathname } from "next/navigation";

// Use Better Auth's built-in type inference
import type { authClient } from "@/lib/auth-client";

import { Link } from "@/components/fastLink";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { NavCollapsible } from "@/components/sidebar/nav-collapsible";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
	Activity,
	ArrowLeft,
	BrickWallFireIcon,
	CheckSquare,
	Cog,
	CreditCard,
	DollarSign,
	FileClipboard,
	FileText,
	FocusIcon,
	GraduationCap,
	GoalIcon,
	InboxIcon,
	MessageSquare,
	Package,
	Phone,
	Settings,
	ShieldCheckIcon,
	Star,
	Tag,
	Users,
	UserCircle,
} from "lucide-react";
import AppBranding from "./app-branding";
import { NavMain } from "./nav-main";
import { SidebarItemComponent } from "./sidebar-item";

type Session = typeof authClient.$Infer.Session;

// Reusable components and data (kept for future use)

// Back to main navigation button
function BackToMainButton() {
	return (
		<Link
			href="/dashboard"
			className="before:-inset-2 relative m-0 inline-flex h-6 min-w-6 shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-[5px] border border-transparent border-solid bg-transparent py-0 pr-1.5 pl-0.5 font-medium text-[13px] text-muted-foreground transition-all duration-150 before:absolute before:content-[''] hover:bg-accent hover:text-accent-foreground disabled:cursor-default disabled:opacity-60"
		>
			<ArrowLeft className="mr-1.5 h-4 w-4" />
			Back to app
		</Link>
	);
}

// Settings navigation items
const settingsNavItems = [
	{
		name: "Account",
		items: [
			{
				icon: <Users size={16} />,
				name: "Profile",
				href: "/dashboard/settings/profile",
			},
		],
	},

	{
		name: "Administration",
		items: [
			{
				icon: <Users size={16} />,
				name: "Team",
				href: "/dashboard/settings/team",
			},
		],
	},
];

export function AppSidebar({
	session,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	session: Session;
}) {
	const pathname = usePathname();
	const currentArea = pathname?.includes("/dashboard/settings")
		? "settings"
		: "main";

	const isImpersonating =
		session.session.impersonatedBy !== null &&
		session.session.impersonatedBy !== undefined;

	// Navigation data with full structure based on XML specification
	const data = {
		navMain: [
			{
				title: "Operations",
				url: "#",
				icon: Activity,
				items: [
					{
						title: "Athletes",
						url: "/dashboard/athletes",
					},
					{
						title: "Athlete Applications",
						url: "/dashboard/athlete-applications",
					},
				],
			},
			{
				title: "Directory",
				url: "#",
				icon: GraduationCap,
				items: [
					{
						title: "Universities",
						url: "/dashboard/universities",
					},
					{
						title: "Coaches",
						url: "/dashboard/coaches",
					},
				],
			},
			{
				title: "Business Admin",
				url: "#",
				icon: ShieldCheckIcon,
				items: [
					{
						title: "Team Members",
						url: "/dashboard/team-members",
					},
				],
			},
		],
		mainNav: [
			{
				name: "Inbox",
				url: "/dashboard",
				icon: InboxIcon,
			},
		],
	};

	return (
		<Sidebar variant="inset" className="w-64" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<AppBranding />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="overflow-hidden">
				<div className="relative h-full w-full overflow-hidden">
					<div
						className="flex h-full w-[200%] transition-transform duration-300 ease-in-out"
						style={{
							transform:
								currentArea === "settings"
									? "translateX(-50%)"
									: "translateX(0)",
						}}
					>
						{/* Main Area */}
						<div className="h-full w-1/2 px-2">
							<div className="flex h-full flex-col">
								{/* Show impersonation banner at the top if impersonating */}
								{isImpersonating && <ImpersonationBanner session={session} />}

								{/*  <div className="mt-4">
					  <NewButton />
					</div> */}
								<div className="mt-4">
									<NavMain items={data.mainNav} />
								</div>
								<div className="mt-8">
									<NavCollapsible items={data.navMain} />
								</div>

								<NavSecondary className="mt-auto" />
							</div>
						</div>

						{/* Settings Area */}
						<div className="h-full w-1/2 px-2">
							<div className="flex h-full flex-col overflow-y-auto">
								<div className="mb-4">
									<BackToMainButton />
								</div>

								<div className="flex-1 space-y-6">
									{settingsNavItems.map((group) => (
										<div key={group.name} className="space-y-2">
											<h2 className="px-2 font-medium text-muted-foreground text-xs">
												{group.name}
											</h2>
											<div className="space-y-1">
												{group.items.map((item) => (
													<SidebarItemComponent
														key={item.name}
														href={item.href}
														label={item.name}
														icon={item.icon}
													/>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={session.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
