import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import MainLayout from "@/components/layout/main-layout";

import { getApplication } from "@/features/athlete-applications/actions/getApplications";
import AthleteApplicationDetailSkeleton from "@/features/athlete-applications/components/athlete-application.detail.skeleton";
import AthleteApplicationDetailView from "@/features/athlete-applications/components/athlete-application.detail.view";
import AthleteApplicationDetailHeader from "@/features/athlete-applications/layout/athlete-application.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface AthleteApplicationDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function AthleteApplicationDetailPage({
	params,
}: AthleteApplicationDetailPageProps) {
	return (
		<Suspense fallback={<AthleteApplicationDetailSkeleton applicationId="" />}>
			<AthleteApplicationDetailPageAsync params={params} />
		</Suspense>
	);
}

async function AthleteApplicationDetailPageAsync({
	params,
}: AthleteApplicationDetailPageProps) {
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

	// Prefetch the application data
	await queryClient.prefetchQuery({
		queryKey: ["applications", "detail", id],
		queryFn: () => getApplication(id),
	});

	// Fetch reference data for the form dropdowns
	const supabase = await createClient();

	// Fetch athletes for dropdown
	const { data: athletes } = await supabase
		.from("athletes")
		.select("id, full_name, graduation_year")
		.eq("is_deleted", false)
		.order("full_name");

	// Fetch universities for dropdown
	const { data: universities } = await supabase
		.from("universities")
		.select("id, name, city")
		.eq("is_deleted", false)
		.order("name");

	// Fetch programs for dropdown
	const { data: programs } = await supabase
		.from("programs")
		.select("id, gender, university_id")
		.eq("is_deleted", false)
		.order("gender");

	// Fetch lead lists for dropdown
	const { data: leadLists } = await supabase
		.from("school_lead_lists")
		.select("id, name, priority")
		.eq("is_deleted", false)
		.order("name");

	// Fetch campaigns for dropdown
	const { data: campaigns } = await supabase
		.from("campaigns")
		.select("id, name, type, status")
		.eq("is_deleted", false)
		.order("name");

	// Fetch coaches with their university jobs for dropdown
	const { data: coaches } = await supabase
		.from("coaches")
		.select(
			`
			id,
			full_name,
			university_jobs (
				id,
				job_title,
				work_email
			)
		`,
		)
		.eq("is_deleted", false)
		.order("full_name");

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<AthleteApplicationDetailHeader
						key="application-detail-header"
						applicationId={id}
					/>,
				]}
			>
				<AthleteApplicationDetailView
					applicationId={id}
					athletes={athletes || []}
					universities={universities || []}
					programs={programs || []}
					leadLists={leadLists || []}
					campaigns={campaigns || []}
					coaches={coaches || []}
				/>
			</MainLayout>
		</HydrationBoundary>
	);
}
