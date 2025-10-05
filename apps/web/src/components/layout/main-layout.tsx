import type * as React from "react";

import { ScrollArea } from "@base-ui-components/react/scroll-area";

interface MainLayoutProps {
	headers: React.ReactNode[];
	children: React.ReactNode;
	className?: string;
	headerHeight?: number;
	totalHeight?: string;
	mobileHeader?: React.ReactNode;
	/**
	 * If you have a sticky sub-header inside the scrollable area, set this to its height in px
	 * to offset the scrollbar so it doesn't overlap the sticky header.
	 */
	scrollbarTopOffset?: number;
	/**
	 * If true, disables the ScrollArea wrapper and renders children directly.
	 * Useful when you want to handle scrolling within the children components.
	 */
	disableScrollArea?: boolean;
}

export default function MainLayout({
	headers,
	children,
	headerHeight = 45,
	scrollbarTopOffset = 0,
	mobileHeader,
	disableScrollArea = false,
}: MainLayoutProps) {
	const headersTotalHeight = headers.length * headerHeight;
	const mobileHeaderHeight = mobileHeader ? 40 : 0;

	return (
		<div className="flex h-[calc(100vh)] w-full flex-col overflow-x-hidden sm:h-[calc(100vh-18px)]">
			{mobileHeader}
			{headers.map((header, idx) => (
				<div
					key={`header-${idx}-${headers.length}`}
					className="w-full"
					style={{ height: `${headerHeight}px` }}
				>
					{header}
				</div>
			))}

			<div
				className="flex-1"
				style={{
					height: `calc(100% - ${headersTotalHeight + mobileHeaderHeight}px)`,
					minHeight: 0, // This ensures the flex-1 works correctly
				}}
			>
				{disableScrollArea ? (
					<div className="h-full w-full">{children}</div>
				) : (
					<ScrollArea.Root className="h-full w-full">
						<ScrollArea.Viewport className="h-full overscroll-contain">
							<div className="relative">{children}</div>
						</ScrollArea.Viewport>
						<div className="hidden sm:block">
							<ScrollArea.Scrollbar
								className="z-50 m-2 flex w-1 justify-center rounded bg-gray-200 opacity-0 transition-opacity delay-300 duration-150 data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[hovering]:delay-0 data-[scrolling]:delay-0 data-[hovering]:duration-150 data-[scrolling]:duration-100 dark:bg-gray-800"
								style={
									scrollbarTopOffset
										? { top: `${scrollbarTopOffset}px` }
										: undefined
								}
							>
								<ScrollArea.Thumb className="w-full rounded bg-gray-500 dark:bg-gray-600" />
							</ScrollArea.Scrollbar>
						</div>
					</ScrollArea.Root>
				)}
			</div>
		</div>
	);
}
