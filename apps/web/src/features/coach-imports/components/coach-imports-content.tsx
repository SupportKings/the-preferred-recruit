"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getImportJobsAction } from "../actions/getImportJobs";
import type { ImportJobWithUploader } from "../types/import-types";
import { ImportJobsTable } from "./import-jobs-table";
import { ImportUploadArea } from "./import-upload-area";

export default function CoachImportsContent() {
	const [jobs, setJobs] = useState<ImportJobWithUploader[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadJobs = async () => {
		setIsLoading(true);
		const result = await getImportJobsAction();
		if (result.success && result.data) {
			setJobs(result.data);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		loadJobs();
	}, []);

	const handleUploadSuccess = () => {
		// Reload jobs after successful upload
		loadJobs();
	};

	const handleJobDeleted = () => {
		// Reload jobs after deletion
		loadJobs();
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div>
				<h2 className="mb-2 font-semibold text-2xl">Upload Coach Data</h2>
				<p className="text-muted-foreground text-sm">
					Upload Excel files containing coach information for batch import
				</p>
			</div>

			<ImportUploadArea onUploadSuccess={handleUploadSuccess} />

			<Card>
				<CardHeader>
					<CardTitle>Import History</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="py-8 text-center text-muted-foreground">
							Loading...
						</div>
					) : (
						<ImportJobsTable jobs={jobs} onJobDeleted={handleJobDeleted} />
					)}
				</CardContent>
			</Card>
		</div>
	);
}
