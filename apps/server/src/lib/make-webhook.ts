interface MakeWebhookPayload {
	event: "user_joined" | "invite_accepted";
	userId: string;
	username: string;
	discriminator: string;
	avatar?: string;
	joinedAt: string;
	guildId: string;
	guildName: string;
	inviteCode?: string;
	inviterUsername?: string;
	inviteChannelId?: string;
	inviteChannelName?: string;
	memberCount?: number;
}

export async function sendToMakeWebhook(payload: MakeWebhookPayload) {
	const webhookUrl =
		payload.event === "user_joined"
			? process.env.MAKE_WEBHOOK_USER_JOINED
			: process.env.MAKE_WEBHOOK_INVITE_ACCEPTED;

	if (!webhookUrl) {
		console.error(`Make.com webhook URL not configured for ${payload.event}`);
		return { success: false, error: "Webhook not configured" };
	}

	try {
		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`Make.com webhook failed: ${response.status}`);
		}

		console.log(`✅ Successfully sent ${payload.event} event to Make.com`);
		return { success: true };
	} catch (error) {
		console.error(`Failed to send ${payload.event} to Make.com:`, error);
		return { success: false, error: String(error) };
	}
}
