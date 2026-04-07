import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MAINTENANCE_KEY } from "@/lib/constants";
import { getAuth } from "./lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "development") return NextResponse.next();
  const { env } = await getCloudflareContext({ async: true });
  const maintenance = (await env.config.get(MAINTENANCE_KEY)) === "true";
  if (!maintenance) return NextResponse.next();

  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
