import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { CreateAthleteApplicationForm } from "@/features/athlete-applications/components/create-athlete-application-form";

import { FileText } from "lucide-react";

interface PageProps {
	searchParams: Promise<{ university_id?: string }>;
}

export default async function NewAthleteApplicationPage({
	searchParams,
}: PageProps) {
	const params = await searchParams;
	const universityId = params.university_id;

	return (
		<div className="container max-w-4xl py-8">
			<div className="mb-6">
				<h1 className="mb-2 flex items-center gap-2 font-bold text-3xl">
					<FileText className="h-8 w-8" />
					Create Athlete Application
				</h1>
				<p className="text-muted-foreground">
					Add a new athlete application to track recruitment progress.
				</p>
			</div>

			<Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
				<CreateAthleteApplicationForm prefilledUniversityId={universityId} />
			</Suspense>
		</div>
	);
}
