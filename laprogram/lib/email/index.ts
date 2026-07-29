import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { renderEmail } from "./render";
import { sendEmail } from "./ses";
import {
  feedbackConfirmationEmail,
  magicLinkEmail,
  type QuarterFeedbackType,
} from "./templates";

export { sendEmail, sendEmails } from "./ses";
export { renderEmail } from "./render";
export {
  isQuarterFeedbackType,
  observationCancelledEmail,
  type QuarterFeedbackType,
} from "./templates";

export async function sendMagicLink(email: string, url: string) {
  const { env } = await getCloudflareContext({ async: true });

  const name = await env.data
    ?.prepare("SELECT id, name FROM user WHERE email = ?")
    .bind(email)
    .first("name");

  if (!name) {
    console.log(
      `User with email ${email} attempted to log in; no such user found`,
    );
    return;
  }

  await sendEmail({
    to: email,
    ...renderEmail(magicLinkEmail(String(name), url)),
  });
}

/**
 * Confirms a mid-/end-of-quarter submission back to the student, calling out
 * whether they included a UID (the only way a submission can be credited).
 */
export async function sendFeedbackConfirmation(params: {
  email: string;
  name: string;
  feedbackType: QuarterFeedbackType;
  course: string;
  la: string;
  uid?: string;
}) {
  const { email, ...content } = params;

  await sendEmail({
    to: email,
    ...renderEmail(
      feedbackConfirmationEmail({
        ...content,
        uid: content.uid?.trim() ? content.uid.trim() : undefined,
      }),
    ),
  });
}
