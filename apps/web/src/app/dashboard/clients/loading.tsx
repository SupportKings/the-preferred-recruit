import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import ClientsHeader from "@/features/clients/layout/clients.header";

export default function ClientsLoading() {
	return (
		<MainLayout headers={[<ClientsHeader key="clients-header" />]}>
			<div className="space-y-6 p-6">
				<div className="space-y-2">
					<Skeleton className="h-10 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Skeleton className="h-32 w-full rounded-lg" />
					<Skeleton className="h-32 w-full rounded-lg" />
					<Skeleton className="h-32 w-full rounded-lg" />
					<Skeleton className="h-32 w-full rounded-lg" />
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Skeleton className="h-64 w-full rounded-lg" />
					<Skeleton className="h-64 w-full rounded-lg" />
				</div>
			</div>
		</MainLayout>
	);
}
