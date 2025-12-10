"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableContentProps {
	children: React.ReactNode;
	maxHeight?: number;
	className?: string;
}

export function ExpandableContent({
	children,
	maxHeight = 200,
	className,
}: ExpandableContentProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [hasOverflow, setHasOverflow] = useState(false);

	useEffect(() => {
		const checkOverflow = () => {
			if (contentRef.current) {
				const hasContentOverflow = contentRef.current.scrollHeight > maxHeight;
				setHasOverflow(hasContentOverflow);
			}
		};

		checkOverflow();

		// Re-check on window resize
		window.addEventListener("resize", checkOverflow);

		// Use ResizeObserver for content changes
		const resizeObserver = new ResizeObserver(checkOverflow);
		if (contentRef.current) {
			resizeObserver.observe(contentRef.current);
		}

		return () => {
			window.removeEventListener("resize", checkOverflow);
			resizeObserver.disconnect();
		};
	}, [maxHeight]);

	return (
		<div className={className}>
			{/* Content wrapper with fade */}
			<div className="relative">
				<div
					ref={contentRef}
					className="overflow-hidden transition-[max-height] duration-200"
					style={{
						maxHeight: isExpanded
							? contentRef.current?.scrollHeight
							: maxHeight,
					}}
				>
					{children}
				</div>

				{/* Fade gradient overlay - only show when collapsed and has overflow */}
				{!isExpanded && hasOverflow && (
					<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-card to-transparent" />
				)}
			</div>

			{/* Show more/less button - only show when content overflows */}
			{hasOverflow && (
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="mt-2 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
				>
					{isExpanded ? (
						<>
							Show less
							<ChevronUp className="h-4 w-4" />
						</>
					) : (
						<>
							Show more
							<ChevronDown className="h-4 w-4" />
						</>
					)}
				</button>
			)}
		</div>
	);
}
