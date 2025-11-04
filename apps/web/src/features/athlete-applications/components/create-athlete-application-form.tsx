"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { UniversityLookup } from "@/components/lookups/university-lookup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AthleteLookup } from "@/features/athletes/components/lookups/athlete-lookup";
import { ProgramLookup } from "@/features/athletes/components/lookups/program-lookup";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createAthleteApplicationAction } from "../actions/createAthleteApplication";
import { APPLICATION_STAGES } from "../types/athleteApplication";

interface CreateAthleteApplicationFormProps {
	prefilledUniversityId?: string;
}

export function CreateAthleteApplicationForm({
	prefilledUniversityId,
}: CreateAthleteApplicationFormProps) {
	const router = useRouter();

	const [formData, setFormData] = useState({
		athlete_id: "",
		university_id: prefilledUniversityId || "",
		program_id: "",
		stage: "",
		start_date: "",
		offer_date: "",
		commitment_date: "",
		scholarship_amount_per_year: "",
		scholarship_percent: "",
		internal_notes: "",
	});

	// Track previous university_id to reset program when it changes
	const prevUniversityIdRef = useRef(formData.university_id);

	useEffect(() => {
		if (
			prevUniversityIdRef.current &&
			prevUniversityIdRef.current !== formData.university_id
		) {
			setFormData((prev) => ({
				...prev,
				program_id: "",
			}));
		}
		prevUniversityIdRef.current = formData.university_id;
	}, [formData.university_id]);

	const { execute, isExecuting } = useAction(createAthleteApplicationAction, {
		onSuccess: (result) => {
			if (result.data?.success) {
				toast.success("Application created successfully!");
				router.push(`/dashboard/athlete-applications/${result.data.data.id}`);
			}
		},
		onError: (error) => {
			toast.error(error.error?.serverError || "Failed to create application");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Transform form data for submission
		const submitData = {
			athlete_id: formData.athlete_id || undefined,
			university_id: formData.university_id || undefined,
			program_id: formData.program_id || undefined,
			stage: formData.stage || undefined,
			start_date: formData.start_date || undefined,
			offer_date: formData.offer_date || undefined,
			commitment_date: formData.commitment_date || undefined,
			scholarship_amount_per_year: formData.scholarship_amount_per_year
				? Number.parseFloat(formData.scholarship_amount_per_year)
				: undefined,
			scholarship_percent: formData.scholarship_percent
				? Number.parseFloat(formData.scholarship_percent)
				: undefined,
			internal_notes: formData.internal_notes || undefined,
		};

		execute(submitData as Parameters<typeof createAthleteApplicationAction>[0]);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Application Details</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* University (Prefilled if from parent) */}
					<div>
						<UniversityLookup
							value={formData.university_id}
							onChange={(value) =>
								setFormData({ ...formData, university_id: value })
							}
							label="University"
							disabled={!!prefilledUniversityId}
						/>
						{prefilledUniversityId && (
							<p className="mt-1 text-muted-foreground text-xs">
								Prefilled link to this university
							</p>
						)}
					</div>

					{/* Athlete */}
					<div>
						<AthleteLookup
							value={formData.athlete_id}
							onChange={(value) =>
								setFormData({ ...formData, athlete_id: value })
							}
							label="Athlete"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Select the applicant
						</p>
					</div>

					{/* Program */}
					<div>
						<ProgramLookup
							universityId={formData.university_id}
							value={formData.program_id}
							onChange={(value) =>
								setFormData({ ...formData, program_id: value })
							}
							label="Program"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Pick the program (men/women)
						</p>
					</div>

					{/* Stage */}
					<div>
						<Label htmlFor="stage">Stage</Label>
						<Select
							value={formData.stage}
							onValueChange={(value) =>
								setFormData({ ...formData, stage: value })
							}
						>
							<SelectTrigger id="stage">
								<SelectValue placeholder="Select stage" />
							</SelectTrigger>
							<SelectContent>
								{APPLICATION_STAGES.map((stage) => (
									<SelectItem key={stage} value={stage} className="capitalize">
										{stage}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="mt-1 text-muted-foreground text-xs">
							Initial application stage
						</p>
					</div>

					{/* Dates */}
					<div className="grid gap-4 md:grid-cols-3">
						<div>
							<Label htmlFor="start_date">Start Date</Label>
							<Input
								id="start_date"
								type="date"
								value={formData.start_date}
								onChange={(e) =>
									setFormData({ ...formData, start_date: e.target.value })
								}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								When this application starts
							</p>
						</div>

						<div>
							<Label htmlFor="offer_date">Offer Date</Label>
							<Input
								id="offer_date"
								type="date"
								value={formData.offer_date}
								onChange={(e) =>
									setFormData({ ...formData, offer_date: e.target.value })
								}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Offer date, if applicable
							</p>
						</div>

						<div>
							<Label htmlFor="commitment_date">Commitment Date</Label>
							<Input
								id="commitment_date"
								type="date"
								value={formData.commitment_date}
								onChange={(e) =>
									setFormData({
										...formData,
										commitment_date: e.target.value,
									})
								}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Commit date, if applicable
							</p>
						</div>
					</div>

					{/* Scholarship Information */}
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="scholarship_amount_per_year">
								Scholarship/Year (USD)
							</Label>
							<Input
								id="scholarship_amount_per_year"
								type="number"
								min="0"
								step="0.01"
								value={formData.scholarship_amount_per_year}
								onChange={(e) =>
									setFormData({
										...formData,
										scholarship_amount_per_year: e.target.value,
									})
								}
								placeholder="0.00"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Dollar value per year
							</p>
						</div>

						<div>
							<Label htmlFor="scholarship_percent">Scholarship %</Label>
							<Input
								id="scholarship_percent"
								type="number"
								min="0"
								max="100"
								step="0.1"
								value={formData.scholarship_percent}
								onChange={(e) =>
									setFormData({
										...formData,
										scholarship_percent: e.target.value,
									})
								}
								placeholder="0"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Percentage offered
							</p>
						</div>
					</div>

					{/* Internal Notes */}
					<div>
						<Label htmlFor="internal_notes">Internal Notes</Label>
						<Textarea
							id="internal_notes"
							value={formData.internal_notes}
							onChange={(e) =>
								setFormData({ ...formData, internal_notes: e.target.value })
							}
							placeholder="Private notes about this application..."
							rows={4}
						/>
						<p className="mt-1 text-muted-foreground text-xs">Private notes</p>
					</div>

					{/* Form Actions */}
					<div className="flex justify-end gap-3 border-t pt-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							disabled={isExecuting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isExecuting}>
							{isExecuting ? "Creating..." : "Create Application"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
