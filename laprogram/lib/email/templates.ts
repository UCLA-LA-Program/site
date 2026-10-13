import "server-only";

import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { TIMEZONE } from "../constants";
import type { EmailContent } from "./render";

// ---------------------------------------------------------------------------
// Email content. Each template returns blocks only — rendering to HTML and
// plain text happens in ./render.
// ---------------------------------------------------------------------------

export function magicLinkEmail(name: string, url: string): EmailContent {
  return {
    subject: "Your LA Program sign-in link",
    preheader: "Use the button in this email to finish signing in.",
    blocks: [
      { type: "heading", text: `Hi ${name}, let's get you signed in.` },
      {
        type: "text",
        text: "Use the link below to sign in to your UCLA LA Program account. No password needed.",
      },
      { type: "button", label: "Sign in", url },
      {
        type: "text",
        text: "If the button doesn't work, copy and paste this link into your browser:",
        muted: true,
        htmlOnly: true,
      },
      { type: "url", url, htmlOnly: true },
      {
        type: "note",
        tone: "info",
        text: "This link can only be used once. If you didn't request it, you can safely ignore this email — no one can access your account without it.",
      },
    ],
  };
}

/** Sent to an observer whose scheduled observee has withdrawn from the program. */
export function observationCancelledEmail(
  name: string,
  withdrawnLAs: string[],
): EmailContent {
  const plural = withdrawnLAs.length > 1;

  return {
    subject: `Your observation ${plural ? "sign-ups have" : "sign-up has"} been cancelled`,
    preheader: `${withdrawnLAs.join(", ")} ${plural ? "are" : "is"} no longer in the LA Program.`,
    blocks: [
      { type: "heading", text: `Hi ${name},` },
      {
        type: "text",
        text: `${plural ? "The following LAs are" : `${withdrawnLAs[0]} is`} no longer in the LA Program, so your observation ${plural ? "sign-ups have" : "sign-up has"} been cancelled.`,
      },
      ...(plural
        ? ([{ type: "bullets", items: withdrawnLAs }] as EmailContent["blocks"])
        : []),
      {
        type: "text",
        text: "Those observation slots have been reopened. Please sign up for a new observation to stay on track for the quarter.",
      },
      {
        type: "button",
        label: "Sign up for an observation",
        url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "https://www.laprogramucla.com"}/observations/signup`,
      },
    ],
  };
}

const FEEDBACK_TYPE_LABELS = {
  mid_quarter: "Mid-Quarter Feedback",
  end_of_quarter: "End-of-Quarter Feedback",
} as const;

export type QuarterFeedbackType = keyof typeof FEEDBACK_TYPE_LABELS;

export function isQuarterFeedbackType(
  value: string,
): value is QuarterFeedbackType {
  return value in FEEDBACK_TYPE_LABELS;
}

/** Shows enough of the UID to confirm what was submitted without echoing it in full. */
function maskUid(uid: string) {
  return `${"•".repeat(Math.max(uid.length - 4, 0))}${uid.slice(-4)}`;
}

export function feedbackConfirmationEmail({
  name,
  feedbackType,
  course,
  la,
  uid,
}: {
  name: string;
  feedbackType: QuarterFeedbackType;
  course: string;
  la: string;
  uid?: string;
}): EmailContent {
  const typeLabel = FEEDBACK_TYPE_LABELS[feedbackType];
  const hasUid = Boolean(uid);
  const submittedAt = `${format(TZDate.tz(TIMEZONE), "MMMM d, yyyy 'at' h:mm a")} PT`;

  return {
    subject: `We received your ${typeLabel.toLowerCase()} for ${la}`,
    preheader: hasUid
      ? `Your UID was included, so this submission can be credited.`
      : `Heads up: you did not include a UID with this submission.`,
    blocks: [
      { type: "heading", text: `Thanks, ${name}!` },
      {
        type: "text",
        text: `Your ${typeLabel.toLowerCase()} has been recorded. Here's a copy of what was submitted:`,
      },
      {
        type: "facts",
        items: [
          { label: "Feedback type", value: typeLabel },
          { label: "Course", value: course },
          { label: "LA", value: la },
          { label: "Submitted", value: submittedAt },
          {
            label: "UID",
            value: uid ? maskUid(uid) : "Not provided",
          },
        ],
      },
      hasUid
        ? {
            type: "note",
            tone: "success",
            title: "Your UID was included",
            text: "If your instructor is offering credit for completing this feedback, this submission can be matched to you.",
          }
        : {
            type: "note",
            tone: "warning",
            title: "You did not include your UID",
            text: "This submission cannot be matched to you, so it cannot be counted toward course credit. If your instructor is offering credit for completing this feedback, submit the form again with your 9-digit UID included.",
          },
      {
        type: "text",
        text: "Your responses are shared with LAs and instructors with UIDs removed, so your feedback stays anonymous either way.",
        muted: true,
      },
    ],
  };
}
