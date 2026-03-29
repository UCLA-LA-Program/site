import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as postmark from "postmark";

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

  const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

  const response = await client.sendEmailWithTemplate({
    TemplateId: 44160184,
    From: "admin@laprogramucla.com",
    To: email,
    TemplateModel: { name: name, action_url: url },
  });
  console.log(response);
}
