import type React from "react";

interface KPICard {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ReactNode;
}

interface DashboardLayoutProps {
	welcomeName: string;
	subtitle?: string;
	kpiCards: KPICard[];
	children: React.ReactNode;
}

export default function DashboardLayout({
	welcomeName,
	subtitle = "Here's what's happening with your business today.",
	kpiCards,
	children,
}: DashboardLayoutProps) {
	return (
		<div className="space-y-8 p-6">
			{/* Welcome Section */}
			<div className="space-y-2">
				<h1 className="font-bold text-3xl text-foreground">
					Welcome back, {welcomeName}!
				</h1>
				<p className="text-muted-foreground">{subtitle}</p>
			</div>

			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{kpiCards.map((card, index) => (
					<div
						key={index}
						className="space-y-2 rounded-lg border border-border bg-card p-6"
					>
						<div className="flex items-center justify-between">
							<p className="text-muted-foreground text-sm">{card.title}</p>
							{card.icon && (
								<div className="text-muted-foreground">{card.icon}</div>
							)}
						</div>
						<div className="space-y-1">
							<p className="font-bold text-2xl text-foreground">{card.value}</p>
							{card.subtitle && (
								<p className="text-muted-foreground text-sm">{card.subtitle}</p>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Content Cards */}
			<div className="space-y-6">{children}</div>
		</div>
	);
}
