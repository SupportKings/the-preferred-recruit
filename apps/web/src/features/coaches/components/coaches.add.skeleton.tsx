import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import CoachesAddHeader from "../layout/coaches.add.header";

export default function CoachesAddSkeleton() {
	return (
		<MainLayout headers={[<CoachesAddHeader key="coaches-add-header" />]}>
			<div className="space-y-8 p-6">
				{/* Identity Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-32" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Contact Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-32" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Profiles Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-32" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Internal Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-32 w-full" />
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
