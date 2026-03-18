import { Awaitable, betterAuth, GenericEndpointContext } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

interface KvTable {
  key: string;
  value: string;
}

interface Database {
  kv: KvTable;
}

async function authBuilder() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.auth_db) {
    throw Error("Could not find D1 auth_db for BetterAuth initialization");
  }

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.auth_db }),
  });

  return betterAuth({
    db,
    plugins: [
      magicLink({
        sendMagicLink: function (
          data: { email: string; url: string; token: string },
          _ctx?: GenericEndpointContext | undefined,
        ): Awaitable<void> {
          console.log(data.url);
        },
      }),
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
