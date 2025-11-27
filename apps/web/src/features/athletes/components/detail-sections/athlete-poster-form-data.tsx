"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpandableContent } from "@/components/ui/expandable-content";

import { ExternalLink, Image as ImageIcon, Video } from "lucide-react";

interface PosterFormData {
	submission_id?: string | null;
	submitted_at?: string | null;
	events_and_times?: string | null;
	standout_info?: string | null;
	video_urls?: string[] | null;
}

interface AthletePosterFormDataProps {
	athlete: {
		poster_form_data?: PosterFormData | null;
		poster_primary_url?: string | null;
		poster_image_2_url?: string | null;
		poster_image_3_url?: string | null;
	};
}

/**
 * Formats a date string for display
 */
function formatDate(dateString: string | null | undefined): string {
	if (!dateString) return "Not available";
	try {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateString;
	}
}

export function AthletePosterFormData({ athlete }: AthletePosterFormDataProps) {
	const posterData = athlete.poster_form_data as PosterFormData | null;
	const hasSubmission = Boolean(posterData?.submission_id);

	// Collect all poster images
	const posterImages = [
		{ label: "Primary Image", url: athlete.poster_primary_url },
		{ label: "2nd Image", url: athlete.poster_image_2_url },
		{ label: "3rd Image", url: athlete.poster_image_3_url },
	].filter((img) => img.url);

	// Get video URLs
	const videoUrls = posterData?.video_urls || [];

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					<ImageIcon className="h-5 w-5" />
					Poster Form Submission
				</CardTitle>
			</CardHeader>

			{!hasSubmission ? (
				<CardContent>
					<p className="text-muted-foreground text-sm">
						No poster form submission found
					</p>
				</CardContent>
			) : (
				<CardContent className="pt-0">
					<ExpandableContent maxHeight={310}>
						<div className="space-y-4">
							{/* Submission Info */}
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<span className="block font-medium text-muted-foreground text-sm">
										Tally Submission ID
									</span>
									<p className="font-mono text-sm">
										{posterData?.submission_id || "Not available"}
									</p>
								</div>
								<div>
									<span className="block font-medium text-muted-foreground text-sm">
										Submitted At
									</span>
									<p className="text-sm">
										{formatDate(posterData?.submitted_at)}
									</p>
								</div>
							</div>

							{/* Events & Times */}
							<div>
								<span className="block font-medium text-muted-foreground text-sm">
									Events & Times
								</span>
								<p className="whitespace-pre-wrap text-sm">
									{posterData?.events_and_times || (
										<span className="text-muted-foreground italic">
											Not provided
										</span>
									)}
								</p>
							</div>

							{/* Standout Info */}
							<div>
								<span className="block font-medium text-muted-foreground text-sm">
									Standout Information
								</span>
								<p className="whitespace-pre-wrap text-sm">
									{posterData?.standout_info || (
										<span className="text-muted-foreground italic">
											Not provided
										</span>
									)}
								</p>
							</div>

							{/* Poster Images */}
							<div>
								<span className="mb-2 block font-medium text-muted-foreground text-sm">
									Poster Images
								</span>
								{posterImages.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{posterImages.map((img) => (
											<a
												key={img.label}
												href={img.url ?? ""}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
											>
												<ImageIcon className="h-4 w-4" />
												{img.label}
												<ExternalLink className="h-3 w-3" />
											</a>
										))}
									</div>
								) : (
									<p className="text-muted-foreground text-sm italic">
										No images uploaded
									</p>
								)}
							</div>

							{/* Videos */}
							<div>
								<span className="mb-2 block font-medium text-muted-foreground text-sm">
									Videos
								</span>
								{videoUrls.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{videoUrls.map((url, index) => (
											<a
												key={url}
												href={url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
											>
												<Video className="h-4 w-4" />
												Video {index + 1}
												<ExternalLink className="h-3 w-3" />
											</a>
										))}
									</div>
								) : (
									<p className="text-muted-foreground text-sm italic">
										No videos uploaded
									</p>
								)}
							</div>
						</div>
					</ExpandableContent>
				</CardContent>
			)}
		</Card>
	);
}
