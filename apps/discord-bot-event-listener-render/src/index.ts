import "dotenv/config";

import { DiscordBot } from "./lib/discord-bot";

console.log("🤖 Starting Discord Bot...");

const discordBot = new DiscordBot();
discordBot.start();

// Graceful shutdown
process.on("SIGINT", async () => {
	console.log("\n🛑 Shutting down Discord bot gracefully...");
	await discordBot.stop();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🛑 Shutting down Discord bot gracefully...");
	await discordBot.stop();
	process.exit(0);
});
