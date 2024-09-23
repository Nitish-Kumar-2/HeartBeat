import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export const sendSlackAlert = async (failedApis) => {
  try {
    await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: `Alert: The following APIs are not responding: ${failedApis.join(', ')}`
    });
  } catch (error) {
    console.error('Error sending Slack message:', error);
  }
};