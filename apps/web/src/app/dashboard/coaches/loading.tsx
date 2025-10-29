import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import CoachesHeader from "@/features/coaches/layout/coaches-header";

export default function CoachesLoading() {
	return (
		<MainLayout headers={[<CoachesHeader key="coaches-header" />]}>
			<div className="space-y-6 p-6">
				<div className="space-y-2">
					<Skeleton className="h-10 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>

				<div className="rounded-lg border border-border bg-card p-6">
					<div className="space-y-4">
						<Skeleton className="h-6 w-48" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<Skeleton className="h-20 w-full rounded" />
							<Skeleton className="h-20 w-full rounded" />
							<Skeleton className="h-20 w-full rounded" />
						</div>
						<Skeleton className="h-32 w-full rounded" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
