import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

interface LoginPayload {
  email: string;
  token: string;
  callbackURL?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;
  const { email, token, callbackURL } = body;

  if (!email) {
    return new Response("Invalid request body.", { status: 400 });
  }

  if (process.env.NODE_ENV !== "development") {
    if (!token) {
      return new Response("Invalid request body.", { status: 400 });
    }

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
  } catch {
    return new Response("Failed to send magic link.", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
