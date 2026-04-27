import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getMagicLinkWait } from "@/lib/magic-link-rate-limit";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!email) return NextResponse.json({ waitSeconds: 0 });

  const { env } = await getCloudflareContext({ async: true });
  if (!env.config) return NextResponse.json({ waitSeconds: 0 });

  const waitSeconds = await getMagicLinkWait(env.config, email);
  return NextResponse.json({ waitSeconds });
}
