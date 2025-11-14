// lib/discord-webhook.ts

interface DiscordWebhookPayload {
    username: string;
    userId?: string;
    email?: string;
    avatarUrl?: string;
    additionalInfo?: Record<string, string>;
  }
  
  export async function sendUserJoinedWebhook(payload: DiscordWebhookPayload) {
    const webhookUrl = 'https://hook.us2.make.com/ubibjxw5c8nrjxg5c1ncggxm7m7mk4s5';
  
    if (!webhookUrl) {
      console.error('Discord webhook URL not configured');
      return { success: false, error: 'Webhook not configured' };
    }
  
    const { username, userId, email, avatarUrl, additionalInfo } = payload;
  
    // Build fields array
    const fields = [
      {
        name: '👤 Username',
        value: username,
        inline: true,
      },
    ];
  
    if (userId) {
      fields.push({
        name: '🆔 User ID',
        value: userId,
        inline: true,
      });
    }
  
    if (email) {
      fields.push({
        name: '📧 Email',
        value: email,
        inline: false,
      });
    }
  
    // Add any additional custom fields
    if (additionalInfo) {
      Object.entries(additionalInfo).forEach(([key, value]) => {
        fields.push({
          name: key,
          value: value,
          inline: true,
        });
      });
    }
  
    const embed = {
      title: '🎉 New User Registered!',
      description: `Welcome **${username}** to the platform!`,
      color: 5763719,
      timestamp: new Date().toISOString(),
      fields,
      footer: {
        text: 'User Registration System',
      },
    };
  
   
  
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }
  
      return { success: true };
    } catch (error) {
      console.error('Failed to send Discord webhook:', error);
      return { success: false, error: String(error) };
    }
  }
  