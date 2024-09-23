import { NextResponse } from 'next/server';
import axios from 'axios';
import { apis } from '@/config/apis';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const checkApi = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 60000 }); // 1 minute timeout
    return response.status === 200;
  } catch (error) {
    console.error(`\n\nError checking ${url}:`, error.message);
    console.error(`\n\nError checking ${url}: Status Code: `, error.status);
    return false;
  }
};

const sendSlackAlert = async (failedApis) => {
  if (!SLACK_WEBHOOK_URL) {
    console.error('Slack webhook URL is not configured.');
    return;
  }

  const message = {
    text: 'API Health Check Alert',
    attachments: [
      {
        color: '#FF0000',
        title: 'Failed APIs',
        text: failedApis.join('\n'),
      },
    ],
  };

  try {
    await axios.post(SLACK_WEBHOOK_URL, message);
  } catch (error) {
    console.error('Error sending Slack alert:', error.message);
  }
};

export async function GET() {
  const failedApis = [];
  const runningApis = [];

  await Promise.all(
    apis.map(async (api) => {
      const isUp = await checkApi(api);
      if (!isUp) {
        failedApis.push(api);
      } else {
        runningApis.push(api);
      }
    })
  );

  if (failedApis.length > 0) {
    await sendSlackAlert(failedApis);
  }

  return NextResponse.json({
    message: 'API check completed',
    failedApis,
    runningApis,
  });
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300;