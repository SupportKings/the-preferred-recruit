import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import CoachImportsContent from "@/features/coach-imports/components/coach-imports-content";
import CoachImportsHeader from "@/features/coach-imports/layout/coach-imports-header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function CoachImportsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CoachImportsPageAsync />
		</Suspense>
	);
}

async function CoachImportsPageAsync() {
	const queryClient = new QueryClient();

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<CoachImportsHeader key="coach-imports-header" />]}>
				<CoachImportsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
