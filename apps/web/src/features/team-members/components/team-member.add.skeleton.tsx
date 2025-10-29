import MainLayout from "@/components/layout/main-layout";

import TeamMemberAddHeader from "../layout/team-member.add.header";

export default function TeamMemberAddSkeleton() {
	return (
		<MainLayout headers={[<TeamMemberAddHeader key="header" />]}>
			<div className="space-y-8 p-6">
				{/* Identity Section */}
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="h-6 w-32 animate-pulse rounded bg-muted" />
						<div className="h-4 w-64 animate-pulse rounded bg-muted" />
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{/* Name field */}
						<div className="space-y-2">
							<div className="h-4 w-20 animate-pulse rounded bg-muted" />
							<div className="h-10 w-full animate-pulse rounded bg-muted" />
						</div>

						{/* Job title field */}
						<div className="space-y-2">
							<div className="h-4 w-20 animate-pulse rounded bg-muted" />
							<div className="h-10 w-full animate-pulse rounded bg-muted" />
						</div>

						{/* Timezone field */}
						<div className="space-y-2">
							<div className="h-4 w-20 animate-pulse rounded bg-muted" />
							<div className="h-10 w-full animate-pulse rounded bg-muted" />
						</div>
					</div>
				</div>

				{/* Internal Notes Section */}
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="h-6 w-32 animate-pulse rounded bg-muted" />
						<div className="h-4 w-64 animate-pulse rounded bg-muted" />
					</div>

					{/* Notes textarea */}
					<div className="space-y-2">
						<div className="h-4 w-32 animate-pulse rounded bg-muted" />
						<div className="h-24 w-full animate-pulse rounded bg-muted" />
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-2">
					<div className="h-10 w-40 animate-pulse rounded bg-muted" />
					<div className="h-10 w-20 animate-pulse rounded bg-muted" />
				</div>
			</div>
		</MainLayout>
	);
}
