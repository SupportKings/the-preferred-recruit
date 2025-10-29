import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import AthleteApplicationsAddHeader from "../layout/athlete-applications.add.header";

export default function AthleteApplicationsAddSkeleton() {
	return (
		<MainLayout
			headers={[
				<AthleteApplicationsAddHeader key="athlete-applications-add-header" />,
			]}
		>
			<div className="space-y-8 p-6">
				{/* Core Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-48" />
					<div className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Timeline Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-32" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Scholarship Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-40" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Notes Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-24" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>
		</MainLayout>
	);
}
