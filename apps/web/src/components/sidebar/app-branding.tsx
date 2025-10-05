"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { siteConfig } from "@/siteConfig";

export default function AppBranding() {
	return (
		<div className="flex items-center justify-center rounded-sm border bg-card p-2">
			<div className="relative h-auto w-auto">
				<Image
					src={siteConfig.logo.src}
					alt={`${siteConfig.name} logo`}
					width={120}
					height={0}
					className="h-auto w-auto"
				/>
			</div>
		</div>
	);
}
