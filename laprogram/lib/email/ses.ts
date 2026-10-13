import "server-only";

import { AwsClient } from "aws4fetch";
import type { RenderedEmail } from "./render";

// ---------------------------------------------------------------------------
// AWS SES transport
//
// Calls the SES v2 REST API directly with SigV4 request signing rather than
// pulling in @aws-sdk/client-sesv2, which is far too large for a Worker
// bundle. aws4fetch is a few KB and signs with WebCrypto, which the Workers
// runtime provides natively.
// ---------------------------------------------------------------------------

const REGION = process.env.AWS_REGION ?? "us-east-1";
const FROM_ADDRESS = process.env.SES_FROM_ADDRESS ?? "admin@laprogramucla.com";
const FROM_NAME = "UCLA LA Program";

const ENDPOINT = `https://email.${REGION}.amazonaws.com/v2/email/outbound-emails`;

let client: AwsClient | null = null;

function getClient() {
  if (client) return client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error(
      "Could not load AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY; skipping email send",
    );
    return null;
  }

  client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    service: "ses",
    region: REGION,
  });
  return client;
}

export type SendEmailOptions = RenderedEmail & {
  to: string;
  replyTo?: string;
};

/**
 * Sends one email through SES. Resolves to whether the send succeeded — email
 * is never load-bearing for a request, so callers log and move on rather than
 * failing the user's action.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions): Promise<boolean> {
  // Don't spend real sends (or hit the sandbox recipient allowlist) in dev.
  if (process.env.NODE_ENV === "development") {
    console.log(`[email:dev] to=${to} subject=${subject}\n\n${text}`);
    return true;
  }

  const aws = getClient();
  if (!aws) return false;

  const body = {
    FromEmailAddress: `${FROM_NAME} <${FROM_ADDRESS}>`,
    Destination: { ToAddresses: [to] },
    ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
    ...(process.env.SES_CONFIGURATION_SET
      ? { ConfigurationSetName: process.env.SES_CONFIGURATION_SET }
      : {}),
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          // Both parts are sent so SES builds a multipart/alternative message;
          // clients that can't or won't render HTML fall back to Text.
          Text: { Data: text, Charset: "UTF-8" },
          Html: { Data: html, Charset: "UTF-8" },
        },
      },
    },
  };

  try {
    const response = await aws.fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(
        `SES send failed for ${to}: ${response.status} ${await response.text()}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`SES send threw for ${to}:`, error);
    return false;
  }
}

/** Sends independently to many recipients; one failure doesn't stop the rest. */
export async function sendEmails(messages: SendEmailOptions[]) {
  const results = await Promise.allSettled(messages.map(sendEmail));
  return results.filter((r) => r.status === "fulfilled" && r.value).length;
}
