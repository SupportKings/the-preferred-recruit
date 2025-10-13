import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { getCampaign } from "@/features/campaigns/actions/getCampaign";
import CampaignDetailSkeleton from "@/features/campaigns/components/campaign.detail.skeleton";
import CampaignDetailView from "@/features/campaigns/components/campaign.detail.view";
import CampaignDetailHeader from "@/features/campaigns/layout/campaign.detail.header";
import { getUser } from "@/queries/getUser";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface CampaignDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
	return (
		<Suspense fallback={<CampaignDetailSkeleton campaignId="" />}>
			<CampaignDetailPageAsync params={params} />
		</Suspense>
	);
}

async function CampaignDetailPageAsync({ params }: CampaignDetailPageProps) {
	const { id } = await params;

	// Validate that id is provided
	if (!id) {
		notFound();
	}

	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Prefetch the campaign data
	await queryClient.prefetchQuery({
		queryKey: ["campaigns", "detail", id],
		queryFn: () => getCampaign(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<CampaignDetailHeader key="campaign-detail-header" campaignId={id} />,
				]}
			>
				<CampaignDetailView campaignId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
