import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/serviceRole";

/**
 * GET /api/onboarding-redirect?submissionId=xxx
 *
 * Checks if an athlete has been created from a Tally submission
 * and returns whether they need a poster form or can go directly to Calendly
 */
export async function GET(request: NextRequest) {
	const submissionId = request.nextUrl.searchParams.get("submissionId");

	if (!submissionId) {
		return NextResponse.json(
			{ error: "Missing submissionId parameter" },
			{ status: 400 },
		);
	}

	try {
		const supabase = await createClient();

		// Look up athlete by tally_submission_id
		const { data: athlete, error } = await supabase
			.from("athletes")
			.select("id, full_name, onboarding_form_data")
			.eq("tally_submission_id", submissionId)
			.single();

		if (error || !athlete) {
			// Not found yet - webhook might still be processing
			return NextResponse.json({ found: false });
		}

		// Check if they need poster from onboarding_form_data
		const formData = athlete.onboarding_form_data as Record<
			string,
			unknown
		> | null;
		const needsPoster = formData?.needs_poster === true;

		return NextResponse.json({
			found: true,
			athleteId: athlete.id,
			athleteName: athlete.full_name,
			needsPoster,
		});
	} catch (error) {
		console.error("Error checking submission status:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
