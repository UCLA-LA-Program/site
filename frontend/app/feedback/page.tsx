import type { Metadata } from "next";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "Feedback",
};

export default function FeedbackPage() {
  return <FeedbackForm />;
}
