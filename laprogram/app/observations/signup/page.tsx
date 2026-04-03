import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import SignUp from "./SignUp";

export const metadata: Metadata = {
  title: "Observation Sign-Ups",
};

export default async function ObservationsPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?redirect=/observations/signup");
  }

  const { env } = await getCloudflareContext({ async: true });
  const activeRound = await env.config.get("OBSERVATION_ACTIVE_ROUND");
  if (!activeRound || activeRound === "0") {
    return (
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        <h1 className="mb-2 text-2xl font-bold">Observation Sign-Ups</h1>
        <p className="text-sm text-muted-foreground">
          Observation sign-ups are not yet open. Please check back later.
        </p>
      </div>
    );
  }

  return <SignUp />;
}
