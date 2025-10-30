"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface UrlActionsProps {
	url: string;
	className?: string;
}

export function UrlActions({ url, className }: UrlActionsProps) {
	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("URL copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy URL");
		}
	};

	const handleOpenUrl = () => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	return (
		<div className={className}>
			<div className="flex gap-2">
				<TooltipProvider>
					<Tooltip delayDuration={200}>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								onClick={handleOpenUrl}
								className="group gap-2 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
							>
								<ExternalLink className="h-4 w-4 transition-transform group-hover:scale-110" />
								Open URL
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top" className="max-w-sm">
							<p className="truncate font-mono text-xs">{url}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<Button
					variant="outline"
					size="sm"
					onClick={handleCopyUrl}
					className="group gap-2 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400"
				>
					<Copy className="h-4 w-4 transition-transform group-hover:scale-110" />
					Copy
				</Button>
			</div>
		</div>
	);
}
