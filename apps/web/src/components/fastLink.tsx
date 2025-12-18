"use client";

import {
	type AnchorHTMLAttributes,
	type PropsWithChildren,
	useRef,
} from "react";

import NextLink, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";

// Combine LinkProps with HTML anchor element props
// Omit 'popover' due to type mismatch between React 19 types ("hint" value) and Next.js types
type CustomLinkProps = LinkProps &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "popover">;

export const Link = ({
	children,
	...props
}: PropsWithChildren<CustomLinkProps>) => {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const router = useRouter();

	return (
		<NextLink
			{...props}
			ref={linkRef}
			onMouseDown={(e) => {
				const url = new URL(String(props.href), window.location.href);
				if (
					url.origin === window.location.origin &&
					e.button === 0 &&
					!e.altKey &&
					!e.ctrlKey &&
					!e.metaKey &&
					!e.shiftKey
				) {
					e.preventDefault();
					router.push(String(props.href));
				}
			}}
		>
			{children as React.ReactNode}
		</NextLink>
	);
};
