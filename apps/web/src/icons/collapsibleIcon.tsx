import type React from "react";

export function ChevronIcon(props: React.ComponentProps<"svg">) {
	return (
		<svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
			<path d="M3.5 9L7.5 5L3.5 1" stroke="currentcolor" />
		</svg>
	);
}
