import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  FEATURE_FLAGS,
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { Admin } from "./Admin";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    notFound();
  }

  const { env } = await getCloudflareContext({ async: true });
  const keys = [
    ...FEATURE_FLAGS.map((f) => f.key),
    QUARTER_START_KEY,
    OBSERVATION_ACTIVE_ROUND_KEY,
    `${OBSERVATION_ROUND_WEEKS_PREFIX}1`,
    `${OBSERVATION_ROUND_WEEKS_PREFIX}2`,
  ];
  const config = Object.fromEntries(await env.config.get(keys));

  return <Admin initialConfig={config} />;
}
