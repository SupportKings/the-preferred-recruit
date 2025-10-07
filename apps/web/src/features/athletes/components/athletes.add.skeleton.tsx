import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import AthletesAddHeader from "../layout/athletes.add.header";

export default function AthletesAddSkeleton() {
	return (
		<MainLayout headers={[<AthletesAddHeader key="athletes-add-header" />]}>
			<div className="space-y-8 p-6">
				{/* Identity & Contact Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-48" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Schooling Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-32" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Profiles & Academic Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-56" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Contract & Sales Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-48" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<div className="md:col-span-2">
							<Skeleton className="h-24 w-full" />
						</div>
					</div>
				</div>

				{/* Discord Section */}
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
