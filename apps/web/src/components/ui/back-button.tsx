"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { ArrowLeftIcon } from "lucide-react";

export function BackButton() {
	const router = useRouter();

	return (
		<Button variant="ghost" size="icon" onClick={() => router.back()}>
			<ArrowLeftIcon className="h-4 w-4" />
		</Button>
	);
}
