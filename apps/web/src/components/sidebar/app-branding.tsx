"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { siteConfig } from "@/siteConfig";

export default function AppBranding() {
	return (
		<div className="flex items-center justify-between rounded-sm border bg-card p-2">
			<div className="flex items-center gap-2">
				<Image
					src={siteConfig.logo.src}
					alt={`${siteConfig.name} logo`}
					width={24}
					height={24}
				/>
				<span className="font-medium text-foreground text-sm">
					{siteConfig.name}
				</span>
			</div>
		</div>
	);
}
