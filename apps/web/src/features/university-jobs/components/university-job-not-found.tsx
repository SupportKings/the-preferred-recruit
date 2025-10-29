"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AlertCircle, ArrowLeft, Home } from "lucide-react";

interface UniversityJobNotFoundProps {
	message?: string;
}

export function UniversityJobNotFound({
	message = "This university job could not be found. It may have been deleted or does not exist.",
}: UniversityJobNotFoundProps) {
	const router = useRouter();

	return (
		<div className="flex min-h-[400px] items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-5 w-5" />
						University Job Not Found
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground text-sm">{message}</p>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => router.back()}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go Back
						</Button>
						<Button onClick={() => router.push("/dashboard")}>
							<Home className="mr-2 h-4 w-4" />
							Dashboard
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
