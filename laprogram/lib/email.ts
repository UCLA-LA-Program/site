import "server-only";

import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export default async function sendMagicLink(email: string, url: string) {
  const { env } = await getCloudflareContext({ async: true });

  const sesClient = new SESv2Client({
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const transporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand },
  });
  const user = await env.data
    ?.prepare("SELECT id FROM user WHERE email = ?")
    .bind(email)
    .first();

  if (!user) {
    await transporter.sendMail({
      from: "UCLA LA Program <login@laprogramucla.com>",
      to: email,
      subject: "[UCLA LA Program] — No Account",
      text: `Someone requested a login link for the UCLA LA Program using this email address, but no account exists for ${email}.\n\nIf you believe you have an account, please try other emails before contacting PDT. The email we used to create your account was the email you used to apply to the LA Program.\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `<p>Someone requested a login link for the UCLA LA Program using this email address, but no account exists for <strong>${email}</strong>.</p><p>If you believe you have an account, please try other emails before contacting PDT. The email we used to create your account was the email you used to apply to the LA Program.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });
    return;
  }

  await transporter.sendMail({
    from: "UCLA LA Program <login@laprogramucla.com>",
    to: email,
    subject: "[UCLA LA Program] - Login Link",
    text: `Click the link below to log in to the UCLA LA Program website:\n\n${url}\n\nThis link will expire shortly. If you didn't request this, you can safely ignore this email.`,
    html: `<p>Click the link below to log in to the UCLA LA Program website:</p><p><a href="${url}">Log in!</a></p><p>This link will expire shortly. If you didn't request this, you can safely ignore this email.</p>`,
  });
}
