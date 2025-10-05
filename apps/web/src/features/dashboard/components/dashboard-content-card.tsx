import type React from "react";

interface DashboardContentCardProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	className?: string;
}

export default function DashboardContentCard({
	title,
	subtitle,
	children,
	className = "",
}: DashboardContentCardProps) {
	return (
		<div className={`rounded-lg border border-border bg-card p-6 ${className}`}>
			<div className="mb-6 space-y-2">
				<h2 className="font-semibold text-foreground text-xl">{title}</h2>
				{subtitle && (
					<p className="text-muted-foreground text-sm">{subtitle}</p>
				)}
			</div>
			{children}
		</div>
	);
}
