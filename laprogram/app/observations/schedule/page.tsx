import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentWeek } from "@/lib/utils";
import { QUARTER_START_KEY } from "@/lib/constants";
import { Schedule } from "./Schedule";

export const metadata: Metadata = {
  title: "Schedule Observations",
};

export default async function ObservationsPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?redirect=/observations/schedule");
  }

  const { env } = await getCloudflareContext({ async: true });
  const flag = await env.config.get("OBSERVATION_AVAILABILITY");
  if (flag !== "true") {
    return (
      <div className="mx-auto w-full max-w-4xl px-8 py-10">
        <h1 className="mb-2 text-2xl font-bold">Schedule Observations</h1>
        <p className="text-sm text-muted-foreground">
          Observation scheduling is not yet open. Please check back later.
        </p>
      </div>
    );
  }

  const quarterStart = await env.config.get(QUARTER_START_KEY);
  const currentWeek = getCurrentWeek(quarterStart ?? undefined);

  return <Schedule currentWeek={currentWeek} />;
}
