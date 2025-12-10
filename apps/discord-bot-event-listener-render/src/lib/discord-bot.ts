import {
	Client,
	GatewayIntentBits,
	type GuildMember,
	type Invite,
} from "discord.js";
import pg from "pg";
import { sendToMakeWebhook } from "./make-webhook";

const { Pool } = pg;

interface Athlete {
	id: string;
	full_name: string;
	discord_invite_code: string | null;
	discord_user_id: string | null;
	discord_username: string | null;
}

// Store invite codes -> use counts (not full Invite objects)
// This is the pattern recommended by the discord.js community
type InviteCache = Map<string, number>;

export class DiscordBot {
	private client: Client;
	private invites: Map<string, InviteCache> = new Map();
	private pool: pg.Pool;

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildInvites,
			],
		});

		this.pool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});

		this.setupEventListeners();
	}

	private setupEventListeners() {
		// Bot ready event
		this.client.on("clientReady", async () => {
			console.log(`Discord bot logged in as ${this.client.user?.tag}`);

			// Cache all invites when bot starts for tracking invite usage
			try {
				const guildId = process.env.DISCORD_GUILD_ID || "";
				console.log(`Looking for guild with ID: ${guildId}`);

				const guild = this.client.guilds.cache.get(guildId);

				if (!guild) {
					console.error(
						`Guild not found! Available guilds: ${this.client.guilds.cache.map((g) => `${g.name} (${g.id})`).join(", ")}`,
					);
					return;
				}

				console.log(`Found guild: ${guild.name}`);
				console.log("Fetching invites for guild...");

				const firstInvites = await guild.invites.fetch();
				// Store only code -> uses mapping
				const inviteCache: InviteCache = new Map(
					firstInvites.map((invite) => [invite.code, invite.uses ?? 0]),
				);
				this.invites.set(guild.id, inviteCache);
				console.log(
					`Cached ${inviteCache.size} invites for guild: ${guild.name}`,
				);
			} catch (error) {
				console.error("Failed to cache invites:", error);
				if (error instanceof Error) {
					console.error("Error details:", error.message);
					console.error("Error stack:", error.stack);
				}
			}
		});

		// New invite created - add to cache
		this.client.on("inviteCreate", (invite) => {
			if (!invite.guild) return;

			const guildInvites = this.invites.get(invite.guild.id);
			if (guildInvites) {
				guildInvites.set(invite.code, invite.uses ?? 0);
				console.log(
					`Added new invite ${invite.code} to cache (uses: ${invite.uses ?? 0})`,
				);
			}
		});

		// Invite deleted - remove from cache
		this.client.on("inviteDelete", (invite) => {
			if (!invite.guild) return;

			const guildInvites = this.invites.get(invite.guild.id);
			if (guildInvites) {
				guildInvites.delete(invite.code);
				console.log(`Removed invite ${invite.code} from cache`);
			}
		});

		// Member joined event
		this.client.on("guildMemberAdd", async (member: GuildMember) => {
			console.log(`New member joined: ${member.user.tag}`);

			try {
				// Fetch current invites from Discord
				const newInvites = await member.guild.invites.fetch();
				const oldInvites = this.invites.get(member.guild.id);

				// Find which invite was used by comparing use counts
				let usedInvite: Invite | undefined;

				console.log("Comparing invite use counts...");

				if (oldInvites) {
					// Find the invite where uses increased
					usedInvite = newInvites.find((inv) => {
						const oldUses = oldInvites.get(inv.code) ?? 0;
						const newUses = inv.uses ?? 0;

						if (newUses > oldUses) {
							console.log(
								`Invite ${inv.code}: ${oldUses} -> ${newUses} (MATCH!)`,
							);
							return true;
						}
						return false;
					});

					// If no match, check for invites not in old cache (created while processing)
					if (!usedInvite) {
						usedInvite = newInvites.find((inv) => {
							const inOldCache = oldInvites.has(inv.code);
							const hasUses = (inv.uses ?? 0) > 0;
							if (!inOldCache && hasUses) {
								console.log(
									`New invite ${inv.code} not in cache with ${inv.uses} uses (MATCH!)`,
								);
								return true;
							}
							return false;
						});
					}
				}

				// Update cache with new use counts AFTER comparison
				const newCache: InviteCache = new Map(
					newInvites.map((invite) => [invite.code, invite.uses ?? 0]),
				);
				this.invites.set(member.guild.id, newCache);

				console.log(`Detected invite code: ${usedInvite?.code ?? "none"}`);
				console.log(
					`Old cache size: ${oldInvites?.size ?? 0}, New cache size: ${newCache.size}`,
				);

				// If no invite code detected, skip processing
				if (!usedInvite?.code) {
					console.log(
						`Could not detect invite code for ${member.user.tag}, skipping`,
					);
					return;
				}

				// Look up athlete by invite code
				const athlete = await this.findAthleteByInviteCode(usedInvite.code);

				if (!athlete) {
					console.log(
						`No athlete found for invite code ${usedInvite.code}, skipping`,
					);
					return;
				}

				console.log(
					`Matched invite code ${usedInvite.code} to athlete: ${athlete.full_name}`,
				);

				// Update athlete with Discord user info
				await this.updateAthleteDiscordInfo(
					athlete.id,
					member.user.id,
					member.user.username,
				);

				// Prepare webhook payload with athlete info
				const payload = {
					event: "invite_accepted" as const,
					userId: member.user.id,
					username: member.user.username,
					athleteId: athlete.id,
					athleteName: athlete.full_name,
					joinedAt: member.joinedAt?.toISOString() || new Date().toISOString(),
					inviteCode: usedInvite.code,
				};

				// Send to Make.com
				await sendToMakeWebhook(payload);

				console.log(
					`Sent invite_accepted event for ${member.user.tag} (athlete: ${athlete.full_name}) to Make.com`,
				);
			} catch (error) {
				console.error("Error processing member join:", error);
			}
		});

		// Error handling
		this.client.on("error", (error) => {
			console.error("Discord bot error:", error);
		});
	}

	private async findAthleteByInviteCode(
		inviteCode: string,
	): Promise<Athlete | null> {
		try {
			const result = await this.pool.query<Athlete>(
				"SELECT id, full_name, discord_invite_code, discord_user_id, discord_username FROM athletes WHERE discord_invite_code = $1 AND is_deleted = false LIMIT 1",
				[inviteCode],
			);
			return result.rows[0] || null;
		} catch (error) {
			console.error("Error querying athlete by invite code:", error);
			return null;
		}
	}

	private async updateAthleteDiscordInfo(
		athleteId: string,
		discordUserId: string,
		discordUsername: string,
	): Promise<void> {
		try {
			await this.pool.query(
				"UPDATE athletes SET discord_user_id = $1, discord_username = $2, updated_at = NOW() WHERE id = $3",
				[discordUserId, discordUsername, athleteId],
			);
			console.log(`Updated athlete ${athleteId} with Discord info`);
		} catch (error) {
			console.error("Error updating athlete Discord info:", error);
		}
	}

	async start() {
		const token = process.env.DISCORD_BOT_TOKEN;
		const guildId = process.env.DISCORD_GUILD_ID;

		if (!token) {
			console.error("DISCORD_BOT_TOKEN is not set in environment variables");
			return;
		}

		if (!guildId) {
			console.error("DISCORD_GUILD_ID is not set in environment variables");
			return;
		}

		try {
			await this.client.login(token);
		} catch (error) {
			console.error("Failed to start Discord bot:", error);
		}
	}

	async stop() {
		console.log("Shutting down Discord bot...");
		await this.pool.end();
		await this.client.destroy();
	}
}
