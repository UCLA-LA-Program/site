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
import { Button } from "@/components/ui/button";
import { Download, BarChart3, ChartPie, X } from "lucide-react";
import { useState } from "react";
import { fetcher } from "@/lib/utils";
import useSWRImmutable from "swr";
import type { AnonFeedback } from "./columns";
import type { Position } from "@/types/db";
import * as XLSX from "xlsx";

interface TableDef {
  id: string;
  label: string;
  columns: Column[];
  filter: (f: AnonFeedback) => boolean;
}

export function buildTables(positions: Position[]): TableDef[] {
  const positionSet = new Set(positions.map((p) => p.position));

  if (positionSet.size === 0) {
    return [];
  }

  const isOnlyLcc = positionSet.size === 1 && positionSet.has("lcc");
  if (isOnlyLcc) {
    return [
      {
        id: "head_la",
        label: "Head LA (LCC)",
        columns: headLALccColumns,
        filter: (f) => "feedback_type" in f && f.feedback_type === "la_head_la",
      },
    ];
  }

  const isPed = positionSet.has("ped") || positionSet.has("ped_lcc");
  const isLcc =
    positionSet.has("lcc") ||
    positionSet.has("ped_lcc") ||
    positionSet.has("ret_lcc");

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

function downloadExcel(tables: TableDef[], feedback: AnonFeedback[]) {
  const wb = XLSX.utils.book_new();
  for (const t of tables) {
    const rows = feedback.filter(t.filter);
    const data = rows.map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of t.columns) {
        const raw = (row as Record<string, unknown>)[col.key];
        obj[col.header] = col.render ? col.render(raw) : raw;
      }
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, t.label.slice(0, 31));
  }
  XLSX.writeFile(wb, "feedback.xlsx");
}

export function FeedbackView() {
  const [graphMode, setGraphMode] = useState<"none" | "bars" | "pie">("bars");
  const { data: feedback } = useSWRImmutable<AnonFeedback[]>(
    "/api/feedback",
    fetcher,
    {
      suspense: true,
      fallbackData: [],
    },
  );
  const { data: positions } = useSWRImmutable<Position[]>(
    "/api/la/self",
    fetcher,
    {
      suspense: true,
      fallbackData: [],
    },
  );

  if (!feedback || !positions || positions.length === 0) return <></>;

  const tables = buildTables(positions);
  return (
    <div className="mx-auto w-full px-8 py-5 animate-fade-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Feedback Responses
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadExcel(tables, feedback)}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export Excel
        </Button>
      </div>
      <Tabs defaultValue={tables[0].id}>
        <div className="flex items-center gap-2">
          <TabsList>
            {tables.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-0.5 rounded-lg border p-0.5">
            {(
              [
                { value: "none", icon: X, label: "Hide graphs" },
                { value: "bars", icon: BarChart3, label: "Bar charts" },
                { value: "pie", icon: ChartPie, label: "Pie charts" },
              ] as const
            ).map((opt) => {
              const active = graphMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGraphMode(opt.value)}
                  className={`flex items-center gap-1 rounded-md p-1.5 text-xs transition-all duration-200 ${
                    active ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  title={opt.label}
                >
                  <opt.icon className="h-4 w-4 shrink-0" />
                  <span
                    className="overflow-hidden whitespace-nowrap transition-all duration-200"
                    style={{
                      maxWidth: active ? "6rem" : "0",
                      opacity: active ? 1 : 0,
                    }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {tables.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            {(() => {
              const rows = feedback.filter(t.filter);
              return (
                <>
                  {graphMode !== "none" && (
                    <FeedbackDistribution
                      columns={t.columns}
                      data={rows}
                      defaultMode={graphMode}
                    />
                  )}
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
