import type { Metadata } from "next";
import { headers } from "next/headers";
import { FeedbackForm } from "./components/FeedbackForm";
import { ContactUs } from "@/components/ContactUs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import {
  ROLE_OPTIONS,
  STUDENT_FEEDBACK_TYPE_OPTIONS,
  LA_FEEDBACK_TYPE_OPTIONS,
} from "./questions/options";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function FeedbackPage() {
  const { env } = await getCloudflareContext({ async: true });

  const auth = await getAuth();
  const [mq, eq, obs, hla, ta, session] = await Promise.all([
    env.config.get("MID_QUARTER_FEEDBACK"),
    env.config.get("END_OF_QUARTER_FEEDBACK"),
    env.config.get("OBSERVATION_FEEDBACK"),
    env.config.get("HEAD_LA_FEEDBACK"),
    env.config.get("TA_FEEDBACK"),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const on = (v: string | null) => v === "true";

  const roleOptions = ROLE_OPTIONS.filter((o) => {
    switch (o.value) {
      case "student":
        return on(mq) || on(eq);
      case "la":
        return on(obs) || on(hla);
      case "ta":
        return on(ta);
    }
  });

  const feedbackTypeOptions = STUDENT_FEEDBACK_TYPE_OPTIONS.filter((o) => {
    switch (o.value) {
      case "mid_quarter":
        return on(mq);
      case "end_of_quarter":
        return on(eq);
    }
  });

  const laFeedbackTypeOptions = LA_FEEDBACK_TYPE_OPTIONS.filter((o) => {
    switch (o.value) {
      case "la_observation":
        return on(obs);
      case "la_head_la":
        return on(hla);
    }
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-start px-8 py-12">
      <div className="animate-fade-up w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            General LA Feedback Form
          </h1>
          {roleOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              The LA feedback form is not yet open. Please check back later.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Thanks for providing feedback to LAs! If you have any issues
                with this form, please <ContactUs />.
              </p>
              <p className="text-sm text-muted-foreground italic mb-5">
                If you do not have an LA (or if your LA is a volunteer), but you
                still want to receive credit from your instructor for filling
                out this form, you can select &ldquo;No LA&rdquo; as the LA you
                are providing feedback to.
              </p>
              <FeedbackForm
                roleOptions={roleOptions}
                feedbackTypeOptions={feedbackTypeOptions}
                laFeedbackTypeOptions={laFeedbackTypeOptions}
                user={
                  session
                    ? {
                        name: session.user.name,
                        email: session.user.email,
                      }
                    : null
                }
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
