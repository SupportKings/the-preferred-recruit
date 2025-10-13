"use client";

import type * as React from "react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
} from "@/components/ui/sidebar";

import { Settings } from "lucide-react";
import { SidebarItemComponent } from "./sidebar-item";

export function NavSecondary({
	...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarItemComponent
						href="/dashboard/settings/team"
						label="Settings"
						icon={<Settings size={16} />}
					/>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
