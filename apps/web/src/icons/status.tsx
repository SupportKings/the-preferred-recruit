import type React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export interface Status {
	id: string;
	name: string;
	color: string;
	icon: React.FC<IconProps>;
}

export const UnclaimedIcon = ({ className, ...props }: IconProps) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			className={className}
			{...props}
		>
			<circle
				cx="7"
				cy="7"
				r="6"
				fill="none"
				stroke="#bec2c8"
				strokeWidth="2"
				strokeDasharray="1.4 1.74"
				strokeDashoffset="0.65"
			/>
			<circle
				className="progress"
				cx="7"
				cy="7"
				r="2"
				fill="none"
				stroke="#bec2c8"
				strokeWidth="4"
				strokeDasharray="0 100"
				strokeDashoffset="0"
				transform="rotate(-90 7 7)"
			/>
		</svg>
	);
};

export const EscalatedToOwnerIcon = ({ className, ...props }: IconProps) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			className={className}
			{...props}
		>
			<circle
				cx="7"
				cy="7"
				r="6"
				fill="none"
				stroke="#ef4444"
				strokeWidth="2"
				strokeDasharray="3.14 0"
				strokeDashoffset="-0.7"
			/>
			<path
				d="M7 3.5V7.5M7 9.5V10.5"
				stroke="#ef4444"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
};

export const EscalatedToManagerIcon = ({ className, ...props }: IconProps) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			className={className}
			{...props}
		>
			<circle
				cx="7"
				cy="7"
				r="6"
				fill="none"
				stroke="#f97316"
				strokeWidth="2"
				strokeDasharray="3.14 0"
				strokeDashoffset="-0.7"
			/>
			<path
				d="M7 3.5V7.5M7 9.5V10.5"
				stroke="#f97316"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
};

export const OpenIcon = ({ className, ...props }: IconProps) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			className={className}
			{...props}
		>
			<circle
				cx="7"
				cy="7"
				r="6"
				fill="none"
				stroke="#e2e2e2"
				strokeWidth="2"
				strokeDasharray="3.14 0"
				strokeDashoffset="-0.7"
			/>
			<circle
				className="progress"
				cx="7"
				cy="7"
				r="2"
				fill="none"
				stroke="#e2e2e2"
				strokeWidth="4"
				strokeDasharray="0 100"
				strokeDashoffset="0"
				transform="rotate(-90 7 7)"
			/>
		</svg>
	);
};

export const InProgressIcon = ({ className, ...props }: IconProps) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			className={className}
			{...props}
		>
			<circle
				cx="7"
				cy="7"
				r="6"
				fill="none"
				stroke="#facc15"
				strokeWidth="2"
				strokeDasharray="3.14 0"
				strokeDashoffset="-0.7"
			/>
			<circle
				className="progress"
				cx="7"
				cy="7"
				r="2"
				fill="none"
				stroke="#facc15"
				strokeWidth="4"
				strokeDasharray="2.0839231268812295 100"
				strokeDashoffset="0"
				transform="rotate(-90 7 7)"
			/>
		</svg>
	);
};

export const ResolvedIcon = ({ className, ...props }: IconProps) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			className={className}
			{...props}
		>
			<circle
				cx="7"
				cy="7"
				r="6"
				fill="none"
				stroke="#22c55e"
				strokeWidth="2"
				strokeDasharray="3.14 0"
				strokeDashoffset="-0.7"
			/>
			<path
				d="M4.5 7L6.5 9L9.5 5"
				stroke="#22c55e"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export const status: Status[] = [
	{
		id: "open",
		name: "Open",
		color: "#22c55e",
		icon: OpenIcon,
	},
	{
		id: "in_progress",
		name: "In Progress",
		color: "#facc15",
		icon: InProgressIcon,
	},
	{
		id: "resolved",
		name: "Resolved",
		color: "#3b82f6",
		icon: ResolvedIcon,
	},
	{
		id: "closed",
		name: "Closed",
		color: "#6b7280",
		icon: UnclaimedIcon,
	},
	{
		id: "paused",
		name: "Paused",
		color: "#8b5cf6",
		icon: EscalatedToManagerIcon,
	},
];

export const StatusIcon: React.FC<{ statusId: string }> = ({ statusId }) => {
	const currentStatus = status.find((s) => s.id === statusId);
	if (!currentStatus) return null;

	const IconComponent = currentStatus.icon;
	return <IconComponent />;
};
