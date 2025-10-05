import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function UniversitiesLoading() {
	return (
		<MainLayout headers={[<Skeleton key="header-skeleton" className="h-12 w-48" />]}>
			<div className="space-y-6 p-6">
				<div className="space-y-2">
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-6 w-96" />
				</div>

				<div className="space-y-4 rounded-lg border bg-card p-6">
					<Skeleton className="h-7 w-48" />
					<Skeleton className="h-5 w-80" />
				</div>
			</div>
		</MainLayout>
	);
}
