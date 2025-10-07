import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import UniversitiesAddHeader from "../layout/universities.add.header";

export default function UniversitiesAddSkeleton() {
	return (
		<MainLayout
			headers={[<UniversitiesAddHeader key="universities-add-header" />]}
		>
			<div className="space-y-8 p-6">
				{/* Identity & Contact Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-56" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Classifications Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-40" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Location Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-32" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Academics Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-36" />
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
					</div>
				</div>

				{/* Rankings & Identifiers Section */}
				<div className="space-y-4">
					<Skeleton className="h-7 w-52" />
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
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>
		</MainLayout>
	);
}
