"use client";

import { FeedbackTable } from "./FeedbackTable";
import { FeedbackDistribution } from "./FeedbackDistribution";
import {
  midQuarterColumns,
  endOfQuarterColumns,
  observationColumns,
  headLAPedColumns,
  headLALccColumns,
  headLAAllColumns,
  taColumns,
} from "./columns";
import type { Column } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import type { AnonFeedback } from "./columns";
import { Position } from "@/types/db";

interface TableDef {
  id: string;
  label: string;
  columns: Column[];
  filter: (f: AnonFeedback) => boolean;
}

function buildTables(positions: Position[]): TableDef[] {
  const positionSet = new Set(positions.map((p) => p.position));
  const isPed = positionSet.has("ped") || positionSet.has("ped_lcc");
  const isLcc = positionSet.has("lcc") || positionSet.has("ped_lcc");

  const tables: TableDef[] = [
    {
      id: "mid_quarter",
      label: "Mid-Quarter",
      columns: midQuarterColumns,
      filter: (f) => "feedback_type" in f && f.feedback_type === "mid_quarter",
    },
    {
      id: "end_of_quarter",
      label: "End-of-Quarter",
      columns: endOfQuarterColumns,
      filter: (f) =>
        "feedback_type" in f && f.feedback_type === "end_of_quarter",
    },
    {
      id: "observation",
      label: "Observation",
      columns: observationColumns,
      filter: (f) =>
        "feedback_type" in f && f.feedback_type === "la_observation",
    },
  ];

  if (isPed && isLcc) {
    tables.push({
      id: "head_la",
      label: "Head LA",
      columns: headLAAllColumns,
      filter: (f) => "feedback_type" in f && f.feedback_type === "la_head_la",
    });
  } else if (isPed) {
    tables.push({
      id: "head_la",
      label: "Head LA (Ped)",
      columns: headLAPedColumns,
      filter: (f) => "feedback_type" in f && f.feedback_type === "la_head_la",
    });
  } else if (isLcc) {
    tables.push({
      id: "head_la",
      label: "Head LA (LCC)",
      columns: headLALccColumns,
      filter: (f) => "feedback_type" in f && f.feedback_type === "la_head_la",
    });
  }

  tables.push({
    id: "ta",
    label: "TA",
    columns: taColumns,
    filter: (f) => "role" in f && f.role === "ta",
  });

  return tables;
}

export function FeedbackView() {
  const { data: feedback } = useSWR<AnonFeedback[]>("/api/feedback", fetcher, {
    suspense: true,
    fallbackData: [],
  });
  const { data: positions } = useSWR<Position[]>("/api/la/self", fetcher, {
    suspense: true,
    fallbackData: [],
  });

  if (!feedback || !positions) return <></>;
  const tables = buildTables(positions ?? []);

  return (
    <div className="mx-auto w-full px-8 py-5 animate-fade-up">
      <h1 className="mb-5 text-2xl font-bold tracking-tight">
        Feedback Responses
      </h1>
      <Tabs defaultValue="mid_quarter">
        <TabsList>
          {tables.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tables.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            {(() => {
              const rows = feedback.filter(t.filter);
              return (
                <>
                  <FeedbackDistribution columns={t.columns} data={rows} />
                  <FeedbackTable columns={t.columns} data={rows} />
                </>
              );
            })()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
