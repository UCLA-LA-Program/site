"use client";

import { FeedbackTable } from "./table";
import {
  midQuarterColumns,
  endOfQuarterColumns,
  observationColumns,
  headLAColumns,
  taColumns,
} from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import type { AnonFeedback } from "./columns";

const TABLES = [
  {
    id: "mid_quarter",
    label: "Mid-Quarter",
    columns: midQuarterColumns,
    filter: (f: AnonFeedback) =>
      "feedback_type" in f && f.feedback_type === "mid_quarter",
  },
  {
    id: "end_of_quarter",
    label: "End-of-Quarter",
    columns: endOfQuarterColumns,
    filter: (f: AnonFeedback) =>
      "feedback_type" in f && f.feedback_type === "end_of_quarter",
  },
  {
    id: "observation",
    label: "Observation",
    columns: observationColumns,
    filter: (f: AnonFeedback) =>
      "feedback_type" in f && f.feedback_type === "la_observation",
  },
  {
    id: "head_la",
    label: "Head LA",
    columns: headLAColumns,
    filter: (f: AnonFeedback) =>
      "feedback_type" in f && f.feedback_type === "la_head_la",
  },
  {
    id: "ta",
    label: "TA → LA",
    columns: taColumns,
    filter: (f: AnonFeedback) => "role" in f && f.role === "ta",
  },
];

export default function FeedbackViewPage() {
  const { data: session, isPending } = authClient.useSession();
  const { data: feedback } = useSWR<AnonFeedback[]>("/api/feedback", fetcher, {
    suspense: true,
    fallbackData: [],
  });

  if (!isPending && !session) {
    redirect("/login");
  }

  if (!feedback) return <></>;

  return (
    <div className="mx-auto w-full px-8 py-5">
      <h1 className="mb-5 text-2xl font-bold tracking-tight">
        Feedback Responses
      </h1>
      <Tabs defaultValue="mid_quarter">
        <TabsList>
          {TABLES.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABLES.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            <FeedbackTable
              columns={t.columns}
              data={feedback.filter(t.filter)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
