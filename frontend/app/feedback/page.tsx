import type { Metadata } from "next";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "LA Feedback Form",
};

export default function FeedbackPage() {
  return <FeedbackForm />;
}
