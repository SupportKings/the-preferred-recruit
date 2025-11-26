"use client";

import { Suspense, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

const POSTER_FORM_URL = "https://tally.so/r/RGWMNl";
const CALENDLY_URL =
	"https://calendly.com/coachmalik-thepreferredrecruit/onboarding";

// Maximum time to wait for webhook processing (30 seconds)
const MAX_WAIT_TIME = 30000;
// Poll interval (1 second)
const POLL_INTERVAL = 1000;

function OnboardingRedirectContent() {
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<"loading" | "error" | "redirecting">(
		"loading",
	);
	const [message, setMessage] = useState("Processing your submission...");

	const submissionId = searchParams?.get("submissionId") ?? null;

	useEffect(() => {
		if (!submissionId) {
			setStatus("error");
			setMessage("Missing submission ID. Please contact support.");
			return;
		}

		let elapsed = 0;
		let timeoutId: NodeJS.Timeout;

		async function checkAndRedirect() {
			if (!submissionId) return;

			try {
				const response = await fetch(
					`/api/onboarding-redirect?submissionId=${encodeURIComponent(submissionId)}`,
				);

				if (response.ok) {
					const data = await response.json();

					if (data.found) {
						setStatus("redirecting");

						if (data.needsPoster) {
							// Redirect to poster form with athleteId
							setMessage("Redirecting to poster upload form...");
							window.location.href = `${POSTER_FORM_URL}?athleteId=${data.athleteId}`;
						} else {
							// Redirect to Calendly
							setMessage("Redirecting to schedule your call...");
							window.location.href = CALENDLY_URL;
						}
						return;
					}
				}

				// Not found yet, keep polling
				elapsed += POLL_INTERVAL;

				if (elapsed >= MAX_WAIT_TIME) {
					// Timeout - redirect to Calendly as fallback
					setStatus("redirecting");
					setMessage(
						"Taking longer than expected. Redirecting to schedule your call...",
					);
					setTimeout(() => {
						window.location.href = CALENDLY_URL;
					}, 2000);
					return;
				}

				// Poll again
				timeoutId = setTimeout(checkAndRedirect, POLL_INTERVAL);
			} catch (error) {
				console.error("Error checking submission status:", error);
				elapsed += POLL_INTERVAL;

				if (elapsed >= MAX_WAIT_TIME) {
					setStatus("error");
					setMessage(
						"Something went wrong. Please contact support or schedule your call directly.",
					);
					return;
				}

				timeoutId = setTimeout(checkAndRedirect, POLL_INTERVAL);
			}
		}

		checkAndRedirect();

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [submissionId]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
			<div className="w-full max-w-md text-center">
				{status === "loading" && (
					<>
						<div className="mb-6">
							<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
						<h1 className="mb-2 font-semibold text-2xl">Almost there!</h1>
						<p className="text-muted-foreground">{message}</p>
					</>
				)}

				{status === "redirecting" && (
					<>
						<div className="mb-6">
							<div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-green-500/20">
								<svg
									className="h-12 w-12 text-green-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						</div>
						<h1 className="mb-2 font-semibold text-2xl">Success!</h1>
						<p className="text-muted-foreground">{message}</p>
					</>
				)}

				{status === "error" && (
					<>
						<div className="mb-6">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
								<svg
									className="h-6 w-6 text-red-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</div>
						</div>
						<h1 className="mb-2 font-semibold text-2xl">Oops!</h1>
						<p className="mb-4 text-muted-foreground">{message}</p>
						<a
							href={CALENDLY_URL}
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
						>
							Schedule Your Call
						</a>
					</>
				)}
			</div>
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
			<div className="w-full max-w-md text-center">
				<div className="mb-6">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
				<h1 className="mb-2 font-semibold text-2xl">Loading...</h1>
			</div>
		</div>
	);
}

export default function OnboardingRedirectPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<OnboardingRedirectContent />
		</Suspense>
	);
}
