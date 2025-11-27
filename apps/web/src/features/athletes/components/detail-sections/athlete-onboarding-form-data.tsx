"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface AthleteOnboardingFormDataProps {
	athlete: {
		tally_submission_id?: string | null;
		onboarding_form_data?: Record<string, unknown> | null;
	};
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

export function AthleteOnboardingFormData({
	athlete,
}: AthleteOnboardingFormDataProps) {
	const [isOpen, setIsOpen] = useState(false);

	const hasSubmission = Boolean(athlete.tally_submission_id);
	const formData = athlete.onboarding_form_data;
	const formDataEntries = formData ? Object.entries(formData) : [];

	// Filter out empty/null values and unmapped_fields for cleaner display
	const displayEntries = formDataEntries.filter(([key, value]) => {
		if (key === "unmapped_fields") return false;
		if (value === null || value === undefined || value === "") return false;
		if (Array.isArray(value) && value.length === 0) return false;
		return true;
	});

	return (
		<Card>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Kickoff Form Answers
						</div>
						{hasSubmission && (
							<CollapsibleTrigger className="rounded-md p-1 hover:bg-muted">
								{isOpen ? (
									<ChevronUp className="h-5 w-5" />
								) : (
									<ChevronDown className="h-5 w-5" />
								)}
							</CollapsibleTrigger>
						)}
					</CardTitle>
				</CardHeader>

				{!hasSubmission ? (
					<CardContent>
						<p className="text-muted-foreground text-sm">
							No form submission found
						</p>
					</CardContent>
				) : (
					<CollapsibleContent>
						<CardContent className="space-y-4 pt-0">
							{/* Tally Submission ID */}
							<div>
								<span className="block font-medium text-muted-foreground text-sm">
									Tally Submission ID
								</span>
								<p className="font-mono text-sm">
									{athlete.tally_submission_id}
								</p>
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
						</CardContent>
					</CollapsibleContent>
				)}
			</Collapsible>
		</Card>
	);
}
