import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { reserveMagicLinkSend } from "./magic-link-rate-limit";

export async function sendMagicLink(email: string, url: string) {
  const { env } = await getCloudflareContext({ async: true });
  const normalized = email.trim().toLowerCase();

  if (env.config) {
    const allowed = await reserveMagicLinkSend(env.config, normalized);
    if (!allowed) {
      console.log(`Rate limit hit for magic link to ${normalized}`);
      return;
    }
  }

  const name = await env.data
    ?.prepare("SELECT id, name FROM user WHERE email = ?")
    .bind(normalized)
    .first("name");

  if (!name) {
    console.log(
      `User with email ${normalized} attempted to log in; no such user found`,
    );
    return;
  }

  // In local dev (npm run dev) and local preview (npm run preview with
  // NEXTJS_ENV=development in .dev.vars), log the link instead of emailing.
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NEXTJS_ENV === "development"
  ) {
    console.log(`Magic link for ${normalized}: ${url}`);
    return;
  }

  if (!process.env.POSTMARK_SERVER_TOKEN) {
    console.log("Could not load process.env.POSTMARK_SERVER_TOKEN");
    return;
  }

  await fetch("https://api.postmarkapp.com/email/withTemplate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify({
      From: "admin@laprogramucla.com",
      To: email,
      TemplateId: 44160184,
      TemplateModel: {
        name: name,
        action_url: url,
      },
    }),
  });
}
