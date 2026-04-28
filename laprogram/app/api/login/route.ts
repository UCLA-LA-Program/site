import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const bodySchema = z.object({
  email: z.email(),
  token: z.string().min(1),
  callbackURL: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Invalid request body.", { status: 400 });
  }
  const { email, token, callbackURL } = parsed.data;

  if (!process.env.TURNSTILE_SECRET_KEY) {
    return new Response("Turnstile is not configured.", { status: 500 });
  }

  const verifyForm = new FormData();
  verifyForm.append("secret", process.env.TURNSTILE_SECRET_KEY);
  verifyForm.append("response", token);

  const verifyResp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: verifyForm },
  );
  const verifyData = (await verifyResp.json()) as { success: boolean };
  if (!verifyData.success) {
    return new Response("Turnstile verification failed.", { status: 400 });
  }

  try {
    const auth = await getAuth();
    await auth.api.signInMagicLink({
      body: {
        email: email.trim().toLowerCase(),
        callbackURL: callbackURL ?? "/",
      },
      headers: await headers(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send magic link.";
    return new Response(message, { status: 500 });
  }

  return new Response(null, { status: 200 });
}
