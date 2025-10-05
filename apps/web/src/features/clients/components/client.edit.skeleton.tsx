import MainLayout from "@/components/layout/main-layout";

import ClientEditHeader from "../layout/client.edit.header";

interface ClientEditSkeletonProps {
	clientId: string;
}

export default function ClientEditSkeleton({
	clientId,
}: ClientEditSkeletonProps) {
	return (
		<MainLayout
			headers={[
				<ClientEditHeader key="client-edit-header" clientId={clientId} />,
			]}
		>
			<div className="rounded-lg border bg-background p-6">
				<div className="animate-pulse space-y-6">
					{/* Form sections skeleton */}
					{[...Array(4)].map((_, i) => (
						<div key={i} className="space-y-4">
							<div className="h-6 w-40 rounded bg-muted" />
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<div className="h-4 w-24 rounded bg-muted" />
									<div className="h-10 rounded bg-muted" />
								</div>
								<div className="space-y-2">
									<div className="h-4 w-24 rounded bg-muted" />
									<div className="h-10 rounded bg-muted" />
								</div>
							</div>
						</div>
					))}

					{/* Switch fields skeleton */}
					<div className="space-y-4">
						<div className="h-6 w-48 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="flex items-center space-x-2">
								<div className="h-5 w-10 rounded-full bg-muted" />
								<div className="h-4 w-32 rounded bg-muted" />
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-5 w-10 rounded-full bg-muted" />
								<div className="h-4 w-28 rounded bg-muted" />
							</div>
						</div>

						{/* Textarea skeleton */}
						<div className="space-y-2">
							<div className="h-4 w-32 rounded bg-muted" />
							<div className="h-24 rounded bg-muted" />
						</div>
					</div>

					{/* Action buttons skeleton */}
					<div className="flex justify-end space-x-2 border-t pt-4">
						<div className="h-10 w-20 rounded bg-muted" />
						<div className="h-10 w-28 rounded bg-muted" />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
