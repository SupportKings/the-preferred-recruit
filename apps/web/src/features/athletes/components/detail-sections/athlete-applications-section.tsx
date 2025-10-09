import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface AthleteApplicationsSectionProps {
	athleteId: string;
	applications: any[];
}

export function AthleteApplicationsSection({
	athleteId,
	applications,
}: AthleteApplicationsSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<GraduationCap className="h-5 w-5" />
					Applications
				</CardTitle>
			</CardHeader>
			<CardContent>
				{applications.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p className="text-sm">No applications yet</p>
					</div>
				) : (
					<div className="space-y-2">
						{applications.map((app) => (
							<div key={app.id} className="rounded border p-3">
								<p className="font-medium text-sm">
									{app.university?.name || "Unknown University"}
								</p>
								<p className="text-muted-foreground text-xs">
									Stage: {app.stage || "N/A"} • {app.program?.gender || "N/A"}
								</p>
								{app.scholarship_percent && (
									<p className="text-muted-foreground text-xs">
										Scholarship: {app.scholarship_percent}%
									</p>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
