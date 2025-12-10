"use server";

const MAKE_WEBHOOK_URL =
	"https://hook.us2.make.com/u8c7htqdc2blninor6bsb6uld1tmc3jt";

export interface KickoffWebhookPayload {
	athlete_id: string;
	discord_channel_id: string | null;
	discord_username: string | null;
	discord_channel_url: string | null;
	full_name: string;
	contact_email: string | null;
}

export async function triggerKickoffWebhook(
	payload: KickoffWebhookPayload,
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(MAKE_WEBHOOK_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			console.error(
				`Kickoff webhook failed with status ${response.status}:`,
				await response.text(),
			);
			return {
				success: false,
				error: `Webhook returned status ${response.status}`,
			};
		}

		console.log(
			`Kickoff webhook triggered successfully for athlete ${payload.athlete_id}`,
		);
		return { success: true };
	} catch (error) {
		console.error("Error triggering kickoff webhook:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
