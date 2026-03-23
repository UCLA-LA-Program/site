"use client";

import { DataTable } from "./table";
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

const TABLES = [
  { id: "mid_quarter", label: "Mid-Quarter", columns: midQuarterColumns },
  {
    id: "end_of_quarter",
    label: "End-of-Quarter",
    columns: endOfQuarterColumns,
  },
  { id: "observation", label: "Observation", columns: observationColumns },
  { id: "head_la", label: "Head LA", columns: headLAColumns },
  { id: "ta", label: "TA → LA", columns: taColumns },
] as const;

export default function FeedbackViewPage() {
  const { data: session, isPending } = authClient.useSession();
  console.log(session);

  if (!isPending && !session) {
    redirect("/login");
  }

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
            <DataTable columns={t.columns} data={[]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
