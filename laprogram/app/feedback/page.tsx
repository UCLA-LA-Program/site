import type { Metadata } from "next";
import { FeedbackForm } from "./components/FeedbackForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Feedback",
};

export default function FeedbackPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-start px-8 py-12">
      <div className="animate-fade-up w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            General LA Feedback Form
          </h1>
          <p className="text-sm text-muted-foreground">
            Thanks for providing feedback to LAs! If you have any issues with
            this form, please{" "}
            <Link
              href="/contact"
              className="underline-offset-2 hover:underline text-primary"
            >
              contact us
            </Link>
            .
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            If you do not have an LA (or if your LA is a volunteer), but you
            still want to receive credit from your instructor for filling out
            this form, you can select &quot;No LA&quot; as the LA you are
            providing feedback to.
          </p>
        </div>
        <FeedbackForm />
      </div>
    </main>
  );
}
