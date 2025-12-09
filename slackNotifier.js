import { WebClient } from "@slack/web-api";

/**
 * Send a notification to Slack channel
 * @param {string} message - The message to send
 * @param {Object} data - Optional data to include in the message
 */
export async function sendSlackNotification(message, data = null) {
  try {
    // Check if Slack is configured
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
      console.warn("⚠️ Slack not configured. Skipping notification.");
      return;
    }

    // Initialize Slack client with token from env
    const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

    // Format the message with data if provided
    let formattedMessage = message;
    if (data) {
      formattedMessage += "\n```" + JSON.stringify(data, null, 2) + "```";
    }

    // Send message to Slack
    const result = await slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: formattedMessage,
    });

    console.log("✅ Slack notification sent:", result.ts);
    return result;
  } catch (error) {
    console.error("❌ Error sending Slack notification:", error.message);
    // Don't throw error to prevent API failures due to Slack issues
  }
}

/**
 * Send a rich formatted message to Slack with blocks
 * @param {string} title - The title of the notification
 * @param {Object} fields - Key-value pairs to display
 */
export async function sendSlackRichNotification(title, fields = {}) {
  try {
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
      console.warn("⚠️ Slack not configured. Skipping notification.");
      return;
    }

    // Initialize Slack client with token from env
    const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: Object.entries(fields).map(([key, value]) => ({
          type: "mrkdwn",
          text: `*${key}:*\n${value}`,
        })),
      },
      {
        type: "divider",
      },
    ];

    const result = await slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: blocks,
      text: title, // Fallback text
    });

    console.log("✅ Slack rich notification sent:", result.ts);
    return result;
  } catch (error) {
    console.error("❌ Error sending Slack rich notification:", error.message);
  }
}
