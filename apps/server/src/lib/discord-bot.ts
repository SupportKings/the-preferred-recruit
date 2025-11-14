import {
	Client,
	type Collection,
	GatewayIntentBits,
	type GuildMember,
	type Invite,
} from "discord.js";
import { sendToMakeWebhook } from "./make-webhook";

export class DiscordBot {
	private client: Client;
	private invites: Map<string, Collection<string, Invite>> = new Map();

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildInvites,
			],
		});

		this.setupEventListeners();
	}

	private setupEventListeners() {
		// Bot ready event
		this.client.on("ready", async () => {
			console.log(`✅ Discord bot logged in as ${this.client.user?.tag}`);

			// Cache all invites when bot starts for tracking invite usage
			try {
				const guild = this.client.guilds.cache.get(
					process.env.DISCORD_GUILD_ID || "",
				);
				if (guild) {
					const firstInvites = await guild.invites.fetch();
					this.invites.set(guild.id, firstInvites);
					console.log(
						`✅ Cached ${firstInvites.size} invites for guild: ${guild.name}`,
					);
				}
			} catch (error) {
				console.error("❌ Failed to cache invites:", error);
			}
		});

		// New invite created - update cache
		this.client.on("inviteCreate", async (invite) => {
			if (!invite.guild) return;

			try {
				const guild = await this.client.guilds.fetch(invite.guild.id);
				const invites = await guild.invites.fetch();
				this.invites.set(guild.id, invites);
				console.log("📝 Updated invite cache after new invite created");
			} catch (error) {
				console.error("❌ Failed to update invite cache:", error);
			}
		});

		// Invite deleted - update cache
		this.client.on("inviteDelete", async (invite) => {
			if (!invite.guild) return;

			try {
				const guild = await this.client.guilds.fetch(invite.guild.id);
				const invites = await guild.invites.fetch();
				this.invites.set(guild.id, invites);
				console.log("📝 Updated invite cache after invite deleted");
			} catch (error) {
				console.error("❌ Failed to update invite cache:", error);
			}
		});

		// Member joined event
		this.client.on("guildMemberAdd", async (member: GuildMember) => {
			console.log(`👋 New member joined: ${member.user.tag}`);

			try {
				// Fetch current invites
				const newInvites = await member.guild.invites.fetch();
				const oldInvites = this.invites.get(member.guild.id);

				// Find which invite was used by comparing use counts
				let usedInvite: Invite | undefined;
				let inviterUsername: string | undefined;
				let inviteChannelId: string | undefined;
				let inviteChannelName: string | undefined;

				if (oldInvites) {
					usedInvite = newInvites.find((inv) => {
						const oldInv = oldInvites.get(inv.code);
						return oldInv && inv.uses && oldInv.uses && inv.uses > oldInv.uses;
					});

					if (usedInvite?.inviter) {
						inviterUsername = usedInvite.inviter.username;
					}

					// Get channel information from the invite
					if (usedInvite?.channel) {
						inviteChannelId = usedInvite.channel.id;
						inviteChannelName = usedInvite.channel.name || undefined;
					}
				}

				// Update invite cache
				this.invites.set(member.guild.id, newInvites);

				// Prepare webhook payload
				const payload = {
					event: usedInvite
						? ("invite_accepted" as const)
						: ("user_joined" as const),
					userId: member.user.id,
					username: member.user.username,
					discriminator: member.user.discriminator,
					avatar: member.user.avatar || undefined,
					joinedAt: member.joinedAt?.toISOString() || new Date().toISOString(),
					guildId: member.guild.id,
					guildName: member.guild.name,
					inviteCode: usedInvite?.code,
					inviterUsername,
					inviteChannelId,
					inviteChannelName,
					memberCount: member.guild.memberCount,
				};

				// Send to Make.com
				await sendToMakeWebhook(payload);

				console.log(
					`✅ Sent ${payload.event} event for ${member.user.tag} to Make.com`,
				);
			} catch (error) {
				console.error("❌ Error processing member join:", error);
			}
		});

		// Error handling
		this.client.on("error", (error) => {
			console.error("❌ Discord bot error:", error);
		});
	}

	async start() {
		const token = process.env.DISCORD_BOT_TOKEN;
		const guildId = process.env.DISCORD_GUILD_ID;

		if (!token) {
			console.error("❌ DISCORD_BOT_TOKEN is not set in environment variables");
			return;
		}

		if (!guildId) {
			console.error("❌ DISCORD_GUILD_ID is not set in environment variables");
			return;
		}

		try {
			await this.client.login(token);
		} catch (error) {
			console.error("❌ Failed to start Discord bot:", error);
		}
	}

	async stop() {
		console.log("🛑 Shutting down Discord bot...");
		await this.client.destroy();
	}
}
