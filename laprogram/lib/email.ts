import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export default async function sendMagicLink(email: string, url: string) {
  const { env } = await getCloudflareContext({ async: true });

  const name = await env.data
    ?.prepare("SELECT id, name FROM user WHERE email = ?")
    .bind(email)
    .first("name");
  console.log("blah1");

  if (!name) {
    console.log(
      `User with email ${email} attempted to log in; no such user found`,
    );
    return;
  }
  console.log("blah2");

  if (!process.env.POSTMARK_SERVER_TOKEN) {
    console.log("Could not load process.env.POSTMARK_SERVER_TOKEN");
    return;
  }
  console.log("blah3");

  const response = await fetch(
    "https://api.postmarkapp.com/email/withTemplate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN,
        "User-Agent": "Cloudflare-Worker/1.0",
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
    },
  );
  console.log("blah4");

  console.log(response.status);
}
