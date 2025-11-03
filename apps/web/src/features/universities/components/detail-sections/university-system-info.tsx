import type { Tables } from "@/utils/supabase/database.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Clock } from "lucide-react";

interface UniversitySystemInfoProps {
	university: Pick<Tables<"universities">, "id" | "name">;
}

export function UniversitySystemInfo({
	university,
}: UniversitySystemInfoProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					System Information
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<div className="font-medium text-muted-foreground text-sm">
						University ID
					</div>
					<p className="font-mono text-sm">{university.id}</p>
				</div>
			</CardContent>
		</Card>
	);
}
