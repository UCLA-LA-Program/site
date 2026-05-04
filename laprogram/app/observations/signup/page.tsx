import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { QUARTER_START_KEY } from "@/lib/constants";
import { getAccessibleWeeks } from "@/lib/observation-weeks";
import { SignUp } from "./SignUp";

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
  const weeks = await getAccessibleWeeks(env, session.user.email);

  if (weeks.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        <h1 className="mb-2 text-2xl font-bold">Observation Sign-Ups</h1>
        <p className="text-sm text-muted-foreground">
          Observation sign-ups are not yet open. Please check back later.
        </p>
      </div>
    );
  }

  const quarterStart = (await env.config.get(QUARTER_START_KEY)) ?? "";
  const sortedWeeks = [...weeks].sort((a, b) => parseInt(a) - parseInt(b));

  return <SignUp quarterStart={quarterStart} weeks={sortedWeeks} />;
}
