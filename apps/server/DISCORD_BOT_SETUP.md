# Discord Bot Setup Guide

This guide will help you set up the Discord bot to listen for user joins and invite acceptances, forwarding events to Make.com webhooks.

## 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "The Preferred Recruit Bot")
4. Go to the "Bot" section in the left sidebar
5. Click "Add Bot"
6. Under "Privileged Gateway Intents", enable:
   - ✅ **Server Members Intent** (required for member join events)
   - ✅ **Presence Intent** (optional)
   - ✅ **Message Content Intent** (optional)
7. Click "Reset Token" and copy the bot token (you'll need this for `.env`)

## 2. Get Your Discord Server (Guild) ID

1. Open Discord and enable Developer Mode:
   - User Settings → Advanced → Developer Mode (toggle ON)
2. Right-click your server icon in the server list
3. Click "Copy Server ID"
4. Save this ID (you'll need it for `.env`)

## 3. Invite Bot to Your Server

1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select these scopes:
   - ✅ `bot`
3. Select these bot permissions:
   - ✅ `View Channels`
   - ✅ `Manage Server` (needed to view invites)
4. Copy the generated URL at the bottom
5. Open the URL in your browser and invite the bot to your server

## 4. Set Up Make.com Webhooks

1. Go to [Make.com](https://www.make.com)
2. Create a new scenario
3. Add "Webhooks" → "Custom Webhook" as the trigger
4. Copy the webhook URL
5. Create **two separate webhooks** (or use the same for both):
   - One for "user joined" events
   - One for "invite accepted" events

### Webhook Payload Structure

Both webhooks will receive the following JSON structure:

```json
{
  "event": "user_joined" | "invite_accepted",
  "userId": "123456789012345678",
  "username": "john_doe",
  "discriminator": "0",
  "avatar": "a_1234567890abcdef",
  "joinedAt": "2025-11-14T10:30:00.000Z",
  "guildId": "987654321098765432",
  "guildName": "The Preferred Recruit",
  "inviteCode": "abc123XYZ",
  "inviterUsername": "admin_user",
  "inviteChannelId": "123456789012345678",
  "inviteChannelName": "general",
  "memberCount": 150
}
```

**Event Types:**
- `user_joined`: Someone joined the server (couldn't determine which invite was used)
- `invite_accepted`: Someone joined using a tracked invite link

**Note**: `inviteCode`, `inviterUsername`, `inviteChannelId`, and `inviteChannelName` are only present when an invite was tracked.

## 5. Configure Environment Variables

Edit your `apps/server/.env` file and add:

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here

# Make.com Webhooks
MAKE_WEBHOOK_USER_JOINED=https://hook.us2.make.com/your-webhook-url-1
MAKE_WEBHOOK_INVITE_ACCEPTED=https://hook.us2.make.com/your-webhook-url-2
```

**Note**: You can use the same webhook URL for both events if you want to handle them together in Make.com.

## 6. Start the Server

```bash
# From project root
bun dev

# Or start just the server
bun dev:server
```

You should see:
```
✅ Discord bot logged in as YourBot#1234
✅ Cached 5 invites for guild: The Preferred Recruit
```

## 7. Test the Integration

1. Create a test invite link in your Discord server
2. Use an alt account or ask someone to join via that invite
3. Check your server logs - you should see:
   ```
   👋 New member joined: test_user#0
   ✅ Sent invite_accepted event for test_user#0 to Make.com
   ```
4. Verify the webhook was received in Make.com

## How It Works

### Invite Tracking

The bot tracks invite usage by:
1. Caching all server invites when it starts
2. When a member joins, fetching current invites and comparing use counts
3. Identifying which invite code had its use count increment
4. Extracting channel information from the invite (channel ID and name)
5. Sending `invite_accepted` event with invite details to Make.com

### Event Types

- **user_joined**: Sent when the bot can't determine which invite was used (e.g., vanity URLs, widget joins)
- **invite_accepted**: Sent when a specific invite link was used (includes `inviteCode`, `inviterUsername`, `inviteChannelId`, and `inviteChannelName`)

### Cache Updates

The bot automatically updates its invite cache when:
- A new invite is created
- An invite is deleted
- The bot restarts

## Troubleshooting

### Bot doesn't receive join events
- Verify **Server Members Intent** is enabled in Discord Developer Portal
- Check that the bot has "View Channels" and "Manage Server" permissions
- Ensure `DISCORD_GUILD_ID` matches your server ID

### Invites aren't tracked
- Bot needs "Manage Server" permission to view invites
- Old invites from before bot started won't be tracked initially
- Restart the bot to refresh the invite cache

### Webhooks not sending
- Verify webhook URLs are correct in `.env`
- Check server logs for error messages
- Test webhook URL manually with curl:
  ```bash
  curl -X POST "YOUR_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
  ```

### Bot token invalid
- Regenerate token in Discord Developer Portal
- Make sure there are no extra spaces in `.env` file
- Bot token should start with a specific prefix

## File Structure

```
apps/server/src/
├── lib/
│   ├── discord-bot.ts       # Main bot class with event listeners
│   └── make-webhook.ts      # Make.com webhook sender utility
└── index.ts                 # Server startup (bot initialized here)
```

## Next Steps

1. Set up Make.com scenarios to process the webhook data
2. Add additional Discord event listeners if needed
3. Customize the webhook payload structure
4. Add error notifications for failed webhook sends
