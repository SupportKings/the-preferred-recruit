import { Suspense } from "react";

import Link from "next/link";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";

import DashboardHeader from "@/features/dashboard/layout/dashboard-header";

import { getUser } from "@/queries/getUser";
import { siteConfig } from "@/siteConfig";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import DashboardLoading from "./loading";

export default function Home() {
	return (
		<Suspense fallback={<DashboardLoading />}>
			<HomeAsync />
		</Suspense>
	);
}

async function HomeAsync() {
	const queryClient = new QueryClient();

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<DashboardHeader key="dashboard-header" />]}>
				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<h1 className="text-3xl">Welcome to OpsKings Operating System</h1>
						<p className="text-lg text-muted-foreground">
							Welcome Aboard! As our relation goes by, you will see your
							dedicated OS starting to get populated with features.
						</p>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">Points of contact</h2>

						<div className="space-y-3">
							<div className="flex flex-col space-y-1">
								<span className="font-medium text-muted-foreground text-sm">
									Business Analyst
								</span>
								<p className="text-base">
									{siteConfig.contact.businessAnalyst.name}
								</p>
								<a
									href={`mailto:${siteConfig.contact.businessAnalyst.email}`}
									className="text-blue-600 text-sm hover:text-blue-800"
								>
									{siteConfig.contact.businessAnalyst.email}
								</a>
							</div>

							<div className="flex flex-col space-y-1">
								<span className="font-medium text-muted-foreground text-sm">
									Slack Channel
								</span>
								<a
									href={`https://opskings.slack.com/archives/${siteConfig.contact.slackChannel.id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 text-sm hover:text-blue-800"
								>
									#{siteConfig.contact.slackChannel.name}
								</a>
							</div>
						</div>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">Get Started</h2>

						<div className="space-y-3">
							<p className="text-muted-foreground">
								Ready to begin? Start by adding your first client to the system.
							</p>

							<Button asChild>
								<Link href="/dashboard/clients/">
									Review and Add Your First Client
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
