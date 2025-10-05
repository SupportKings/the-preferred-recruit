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
						<h1 className="text-3xl">
							Welcome to The Preferred Recruit Management Portal
						</h1>
						<p className="text-lg text-muted-foreground">
							This management portal helps you track athletes, manage
							applications, and coordinate with universities and coaches.
						</p>
					</div>

					<div className="space-y-4 rounded-lg border bg-card p-6">
						<h2 className="text-xl">About The Preferred Recruit</h2>
						<p className="text-base text-muted-foreground">
							The Preferred Recruit Protocol Equips Our Athletes With Essential
							Skills and Guarantees Communication With D1 Athletes and their
							Coaches. We specialize in personalized recruitment strategies that
							get athletes noticed and connected with college programs. With a
							focus on results, we ensure that our athletes receive the exposure
							and support needed to secure their place on a college team.
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
									href={`https://thepreferredrecruit.slack.com/archives/${siteConfig.contact.slackChannel.id}`}
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
								Ready to begin? Start managing your athletes and building
								connections with college programs.
							</p>

							<Button asChild>
								<Link href="/dashboard/athletes/">Manage Athletes</Link>
							</Button>
						</div>
					</div>
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
