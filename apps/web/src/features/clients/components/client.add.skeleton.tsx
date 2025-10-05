import MainLayout from "@/components/layout/main-layout";

import ClientAddHeader from "../layout/client.add.header";

export default function ClientAddSkeleton() {
	return (
		<MainLayout headers={[<ClientAddHeader key="client-add-header" />]}>
			<div className="space-y-6 rounded-lg border bg-background p-6">
				<div className="animate-pulse space-y-6">
					{/* Form sections skeleton */}
					<div className="space-y-4">
						<div className="h-6 w-32 rounded bg-muted" />
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

					<div className="space-y-4">
						<div className="h-6 w-40 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<div className="h-4 w-24 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
							<div className="space-y-2">
								<div className="h-4 w-32 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="h-6 w-36 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<div className="h-4 w-28 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
							<div className="space-y-2">
								<div className="h-4 w-24 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
						</div>
					</div>

					{/* Switch fields skeleton */}
					<div className="space-y-4">
						<div className="h-6 w-48 rounded bg-muted" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="flex items-center space-x-2">
								<div className="h-5 w-10 rounded-full bg-muted" />
								<div className="h-4 w-36 rounded bg-muted" />
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
