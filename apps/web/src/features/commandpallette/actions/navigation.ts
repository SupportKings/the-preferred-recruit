"use client";

import React, { useMemo } from "react";

import type { Action } from "kbar";
import {
	ChartLineIcon,
	CreditCard,
	InboxIcon,
	Settings,
	Ticket,
	Users,
} from "lucide-react";

export function useNavigationActions(): Action[] {
	return useMemo(() => {
		const actions: Action[] = [];

		// Dashboard/Inbox
		actions.push({
			id: "dashboard",
			name: "Go to Dashboard",
			keywords: "dashboard inbox home",
			section: "Navigation",
			icon: React.createElement(InboxIcon, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard";
			},
		});

		// Reports & Analytics
		actions.push({
			id: "reports",
			name: "Go to Reports & Analytics",
			keywords: "reports analytics overview charts",
			section: "Navigation",
			icon: React.createElement(ChartLineIcon, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard/reports";
			},
		});

		// Clients
		actions.push({
			id: "clients",
			name: "Go to Clients",
			keywords: "clients customers users",
			section: "Navigation",
			icon: React.createElement(Users, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard/clients";
			},
		});

		// Coaches
		actions.push(
			{
				id: "coaches",
				name: "Go to Coaches",
				keywords: "coaches staff team members",
				section: "Navigation",
				icon: React.createElement(Users, { size: 16 }) as any,
				perform: () => {
					window.location.pathname = "/dashboard/coaches";
				},
			},
			{
				id: "capacity",
				name: "Go to Capacity",
				keywords: "capacity scheduling workload",
				section: "Navigation",
				icon: React.createElement(Users, { size: 16 }) as any,
				perform: () => {
					window.location.pathname = "/dashboard/capacity";
				},
			},
		);

		// Support Tickets
		actions.push({
			id: "tickets",
			name: "Go to Support Tickets",
			keywords: "tickets support help desk",
			section: "Navigation",
			icon: React.createElement(Ticket, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard/tickets";
			},
		});

		// Billing & Finance
		actions.push({
			id: "finance",
			name: "Go to Billing & Finance",
			keywords: "billing finance payments invoices",
			section: "Navigation",
			icon: React.createElement(CreditCard, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard/finance";
			},
		});

		// Settings
		actions.push({
			id: "settings",
			name: "Go to Settings",
			keywords: "settings profile configuration",
			section: "Navigation",
			icon: React.createElement(Settings, { size: 16 }) as any,
			perform: () => {
				window.location.pathname = "/dashboard/settings/profile";
			},
		});

		return actions;
	}, []);
}
