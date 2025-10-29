import type { Tables } from "@/utils/supabase/database.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { format } from "date-fns";
import { Clock } from "lucide-react";

const _formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

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
					<label className="font-medium text-muted-foreground text-sm">
						University ID
					</label>
					<p className="font-mono text-xs">{university.id}</p>
				</div>
			</CardContent>
		</Card>
	);
}
