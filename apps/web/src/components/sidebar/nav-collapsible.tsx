"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import { Link } from "@/components/fastLink";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { ChevronIcon } from "@/icons/collapsibleIcon";

import type { LucideIcon } from "lucide-react";
import { SidebarItemComponent } from "./sidebar-item";

function CollapsibleItem({
	item,
	itemIsActive,
	hasActiveSubItem,
	isActive,
}: {
	item: {
		title: string;
		url: string;
		icon: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	};
	itemIsActive: boolean;
	hasActiveSubItem: boolean;
	isActive: (url: string) => boolean;
}) {
	const [open, setOpen] = useState(hasActiveSubItem);

	useEffect(() => {
		if (hasActiveSubItem) {
			setOpen(true);
		}
	}, [hasActiveSubItem]);

	return (
		<SidebarMenuItem>
			<Collapsible open={open} onOpenChange={setOpen}>
				<SidebarMenuButton
					asChild
					isActive={itemIsActive}
					tooltip={item.title}
					className="group"
				>
					<CollapsibleTrigger className="w-full">
						<item.icon />
						<span>{item.title}</span>
						{item.items?.length ? (
							<ChevronIcon className="ml-auto size-3 transition-all ease-out group-data-[panel-open]:rotate-90" />
						) : null}
					</CollapsibleTrigger>
				</SidebarMenuButton>
				{item.items?.length ? (
					<CollapsibleContent className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-all ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
						<SidebarMenuSub>
							{item.items?.map((subItem) => {
								const subItemIsActive = isActive(subItem.url);

								return (
									<SidebarMenuSubItem key={subItem.title}>
										<SidebarMenuSubButton asChild isActive={subItemIsActive}>
											<Link prefetch={true} href={subItem.url}>
												<span>{subItem.title}</span>
											</Link>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								);
							})}
						</SidebarMenuSub>
					</CollapsibleContent>
				) : null}
			</Collapsible>
		</SidebarMenuItem>
	);
}

export function NavCollapsible({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const pathname = usePathname();

	// Function to check if a URL is active
	const isActive = (url: string) => {
		// Exact match for all routes
		return pathname === url;
	};

	// Function to check if a parent should be highlighted (when on sub-routes)
	const isParentActive = (
		parentUrl: string,
		subItems?: { title: string; url: string }[],
	) => {
		// Parent is active if we're exactly on the parent URL
		if (pathname === parentUrl) {
			return true;
		}

		// Parent is also active if we're on any of its direct sub-items
		if (subItems) {
			return subItems.some((subItem) => pathname === subItem.url);
		}

		return false;
	};

	// Function to check if any sub-item is active
	const hasActiveSubItem = (subItems?: { title: string; url: string }[]) => {
		if (!subItems) return false;
		return subItems.some((subItem) => isActive(subItem.url));
	};

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => {
					// Parent item is highlighted when on parent URL or any direct sub-item
					const itemIsActive = isParentActive(item.url, item.items);

					// Check if any sub-item is active for collapsible expansion
					const hasActiveChild = hasActiveSubItem(item.items);

					// If there's only one item, render it directly without collapsible
					if (item.items?.length === 1) {
						const singleItem = item.items[0];

						return (
							<SidebarItemComponent
								key={item.title}
								href={singleItem.url}
								label={singleItem.title}
								icon={<item.icon size={16} />}
							/>
						);
					}

					// Multi-item collapsible
					return (
						<CollapsibleItem
							key={item.title}
							item={item}
							itemIsActive={itemIsActive}
							hasActiveSubItem={hasActiveChild}
							isActive={isActive}
						/>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
