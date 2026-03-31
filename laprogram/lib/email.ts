import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export default async function sendMagicLink(email: string, url: string) {
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

  // just use console for development so we don't hit Postmark API
  if (process.env.NODE_ENV === "development") {
    console.log(url);
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
