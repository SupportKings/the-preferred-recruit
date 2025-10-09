import MainLayout from "@/components/layout/main-layout";

import AthleteDetailHeader from "../layout/athlete.detail.header";

interface AthleteDetailSkeletonProps {
	athleteId: string;
}

export default function AthleteDetailSkeleton({
	athleteId,
}: AthleteDetailSkeletonProps) {
	return (
		<MainLayout
			headers={[
				<AthleteDetailHeader key="athlete-detail-header" athleteId={athleteId} />,
			]}
		>
			<div className="animate-pulse space-y-6 p-6">
				{/* Header skeleton */}
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-4">
						<div className="h-16 w-16 rounded-full bg-muted" />
						<div className="space-y-2">
							<div className="h-8 w-48 rounded bg-muted" />
							<div className="h-4 w-64 rounded bg-muted" />
							<div className="h-4 w-40 rounded bg-muted" />
							<div className="flex space-x-2">
								<div className="h-6 w-16 rounded bg-muted" />
								<div className="h-6 w-24 rounded bg-muted" />
							</div>
						</div>
					</div>
					<div className="h-10 w-32 rounded bg-muted" />
				</div>

				{/* Cards skeleton */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="rounded-lg border p-6">
							<div className="mb-4 h-6 w-32 rounded bg-muted" />
							<div className="space-y-3">
								<div className="h-4 w-full rounded bg-muted" />
								<div className="h-4 w-3/4 rounded bg-muted" />
								<div className="h-4 w-1/2 rounded bg-muted" />
							</div>
						</div>
					))}
				</div>

				{/* Tabs skeleton */}
				<div className="rounded-lg border p-4">
					<div className="mb-4 flex gap-2">
						{[...Array(9)].map((_, i) => (
							<div key={i} className="h-10 w-24 rounded bg-muted" />
						))}
					</div>
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="space-y-1">
									<div className="h-4 w-32 rounded bg-muted" />
									<div className="h-3 w-48 rounded bg-muted" />
								</div>
								<div className="h-3 w-24 rounded bg-muted" />
							</div>
						))}
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
