import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { FeedbackView } from "./FeedbackView";

export const metadata: Metadata = {
  title: "View Feedback",
};

export default async function FeedbackViewPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?redirect=/feedback/view");
  }

  return <FeedbackView />;
}
