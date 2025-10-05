"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
	progress: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
	showPercentage?: boolean;
	color?: string;
}

export function ProgressRing({
	progress,
	size = 120,
	strokeWidth = 8,
	className = "",
	showPercentage = true,
	color = "hsl(var(--primary))",
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDasharray = circumference;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<div
			className={`relative inline-flex items-center justify-center ${className}`}
		>
			<svg width={size} height={size} className="-rotate-90 transform">
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="hsl(var(--muted))"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="opacity-20"
				/>

				{/* Progress circle */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={strokeDasharray}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset }}
					transition={{
						duration: 1.5,
						ease: "easeOut",
						delay: 0.5,
					}}
				/>
			</svg>

			{showPercentage && (
				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 1 }}
					className="absolute inset-0 flex items-center justify-center"
				>
					<span className="font-bold text-2xl text-foreground">
						{Math.round(progress)}%
					</span>
				</motion.div>
			)}
		</div>
	);
}

interface LinearProgressProps {
	progress: number;
	className?: string;
	color?: string;
	backgroundColor?: string;
	height?: number;
	showPercentage?: boolean;
	animated?: boolean;
}

export function LinearProgress({
	progress,
	className = "",
	color = "hsl(var(--primary))",
	backgroundColor = "hsl(var(--muted))",
	height = 8,
	showPercentage = false,
	animated = true,
}: LinearProgressProps) {
	return (
		<div className={`w-full ${className}`}>
			<div className="mb-1 flex items-center justify-between">
				{showPercentage && (
					<span className="font-medium text-muted-foreground text-sm">
						{Math.round(progress)}%
					</span>
				)}
			</div>

			<div
				className="w-full overflow-hidden rounded-full"
				style={{
					backgroundColor,
					height: `${height}px`,
				}}
			>
				<motion.div
					className="h-full rounded-full"
					style={{ backgroundColor: color }}
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={
						animated
							? {
									duration: 1.2,
									ease: "easeOut",
									delay: 0.3,
								}
							: undefined
					}
				/>
			</div>
		</div>
	);
}
