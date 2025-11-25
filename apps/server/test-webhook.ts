import "dotenv/config";

const testPayload = {
	event: "invite_accepted",
	userId: "1234567890123456789",
	username: "TestUser",
	athleteId: "550e8400-e29b-41d4-a716-446655440000",
	athleteName: "John Doe",
	joinedAt: new Date().toISOString(),
	inviteCode: "testABC123",
};

async function sendTestWebhook() {
	const webhookUrl = process.env.MAKE_WEBHOOK_INVITE_ACCEPTED;

	if (!webhookUrl) {
		console.error("MAKE_WEBHOOK_INVITE_ACCEPTED is not set");
		process.exit(1);
	}

	console.log("Sending test webhook to Make.com...");
	console.log("Payload:", JSON.stringify(testPayload, null, 2));

	try {
		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(testPayload),
		});

		if (!response.ok) {
			throw new Error(`Webhook failed: ${response.status}`);
		}

		console.log("✅ Webhook sent successfully!");
		console.log("Response status:", response.status);

		const responseText = await response.text();
		if (responseText) {
			console.log("Response:", responseText);
		}
	} catch (error) {
		console.error("❌ Failed to send webhook:", error);
		process.exit(1);
	}
}

sendTestWebhook();
