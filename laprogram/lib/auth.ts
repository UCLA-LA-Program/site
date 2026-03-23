import "server-only";

import { Awaitable, betterAuth, GenericEndpointContext } from "better-auth";
import { admin, magicLink } from "better-auth/plugins";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { nextCookies } from "better-auth/next-js";

async function authBuilder() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.data) {
    throw Error("Could not find D1 for BetterAuth initialization");
  }

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.BETTER_AUTH_URL],
    database: {
      db: new Kysely({
        dialect: new D1Dialect({ database: env.data }),
      }),
      type: "sqlite",
    },
    plugins: [
      magicLink({
        disableSignUp: true,
        sendMagicLink: function (
          data: { email: string; url: string; token: string },
          _ctx?: GenericEndpointContext | undefined,
        ): Awaitable<void> {
          console.log(data.url);
        },
      }),
      admin(),
      nextCookies(),
    ],
  });
}

// Singleton pattern to ensure a single auth instance
let auth: Awaited<ReturnType<typeof authBuilder>> | null = null;

// Asynchronously initializes and retrieves the shared auth instance
// Note: we need to do this async as CloudflareContext is not available otherwise
export async function getAuth() {
  if (!auth) {
    auth = await authBuilder();
  }
  return auth;
}
