"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpandableContent } from "@/components/ui/expandable-content";

import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";

interface AthleteOnboardingFormDataProps {
	athlete: {
		id: string;
		tally_submission_id?: string | null;
		onboarding_form_data?: Record<string, unknown> | null;
	};
}

/**
 * Copies text to clipboard and shows toast
 */
function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text);
	toast.success("URL copied to clipboard");
}

/**
 * Converts snake_case keys to Title Case labels
 * Handles special cases: NCAA, HBCU, URL stay uppercase
 */
function formatLabel(key: string): string {
	const specialCases: Record<string, string> = {
		ncaa: "NCAA",
		hbcu: "HBCU",
		url: "URL",
		gpa: "GPA",
		sat: "SAT",
		act: "ACT",
	};

	return key
		.split("_")
		.map((word) => {
			const lower = word.toLowerCase();
			if (specialCases[lower]) {
				return specialCases[lower];
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(" ");
}

/**
 * Formats a value for display
 */
function formatValue(value: unknown): string {
	if (value === null || value === undefined) {
		return "Not provided";
	}
	if (Array.isArray(value)) {
		if (value.length === 0) return "None";
		return value.join(", ");
	}
	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}
	if (typeof value === "object") {
		return JSON.stringify(value, null, 2);
	}
	return String(value);
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

export function AthleteOnboardingFormData({
	athlete,
}: AthleteOnboardingFormDataProps) {
	const hasSubmission = Boolean(athlete.tally_submission_id);
	const formData = athlete.onboarding_form_data;
	const formDataEntries = formData ? Object.entries(formData) : [];

	// Get submitted_at from form data
	const submittedAt = formData?.submitted_at as string | null | undefined;

	// Filter out empty/null values, unmapped_fields, and submitted_at for cleaner display
	const displayEntries = formDataEntries.filter(([key, value]) => {
		if (key === "unmapped_fields") return false;
		if (key === "submitted_at") return false;
		if (value === null || value === undefined || value === "") return false;
		if (Array.isArray(value) && value.length === 0) return false;
		return true;
	});

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Kickoff Form Answers
				</CardTitle>
			</CardHeader>

			{!hasSubmission ? (
				<CardContent className="space-y-3">
					<p className="text-muted-foreground text-sm">
						No kickoff form submission yet
					</p>
					<div className="rounded-md border bg-muted/50 p-3">
						<p className="mb-2 text-sm">
							Copy this link and send to Athlete to fill out Kickoff form:
						</p>
						<div className="flex items-center gap-2">
							<span className="flex-1 break-all text-muted-foreground text-xs">
								{`https://tally.so/r/dWba7z?athleteId=${athlete.id}`}
							</span>
							<button
								type="button"
								onClick={() =>
									copyToClipboard(
										`https://tally.so/r/dWba7z?athleteId=${athlete.id}`,
									)
								}
								className="shrink-0 rounded-md border bg-background p-2 transition-colors hover:bg-muted"
								title="Copy URL"
							>
								<Copy className="h-4 w-4" />
							</button>
						</div>
					</div>
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
										{athlete.tally_submission_id}
									</p>
								</div>
								<div>
									<span className="block font-medium text-muted-foreground text-sm">
										Submitted At
									</span>
									<p className="text-sm">{formatDate(submittedAt)}</p>
								</div>
							</div>

							{/* Form Data Fields */}
							{displayEntries.length > 0 ? (
								displayEntries.map(([key, value]) => (
									<div key={key}>
										<span className="block font-medium text-muted-foreground text-sm">
											{formatLabel(key)}
										</span>
										<p className="whitespace-pre-wrap text-sm">
											{formatValue(value)}
										</p>
									</div>
								))
							) : (
								<p className="text-muted-foreground text-sm">
									No additional form data available
								</p>
							)}
						</div>
					</ExpandableContent>
				</CardContent>
			)}
		</Card>
	);
}
