"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { LA_POSITION_OPTIONS } from "@/app/feedback/constants";
import {
  FEATURE_FLAGS,
  OBSERVATION_COUNT_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { fetcher } from "@/lib/utils";

type ConfigData = Record<string, string>;

const CRON_JOBS = [
  {
    key: "init-las",
    label: "Sync LAs",
    description: "Fetch LA roster from Airtable and sync users + course assignments.",
  },
  {
    key: "init-sections",
    label: "Sync Sections",
    description: "Fetch sections from Airtable and sync section data.",
  },
  {
    key: "init-section-assignments",
    label: "Sync Section Assignments",
    description: "Link LAs to their assigned sections. Run after syncing LAs and sections.",
  },
  {
    key: "process-withdraws",
    label: "Process Withdrawals",
    description: "Process LA withdrawals from Airtable.",
  },
] as const;

type JobStatus = "idle" | "running" | "success" | "error";

export default function Admin() {
  const { data, mutate } = useSWR<ConfigData>("/api/config", fetcher);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [jobResults, setJobResults] = useState<Record<string, string>>({});

  if (data === undefined) return <></>;

  async function setValue(key: string, value: string) {
    mutate({ ...data!, [key]: value }, { revalidate: false });
    try {
      const res = await fetch(`/api/admin/flag/${encodeURIComponent(key)}`, {
        method: "POST",
        body: value,
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to save");
    }
    mutate();
  }

  async function runJob(key: string) {
    setJobStatuses((s) => ({ ...s, [key]: "running" }));
    setJobResults((r) => ({ ...r, [key]: "" }));
    try {
      const res = await fetch(`/api/cron/${key}`, {
        method: "POST",
      });
      const text = await res.text();
      setJobResults((r) => ({ ...r, [key]: text }));
      if (res.ok) {
        setJobStatuses((s) => ({ ...s, [key]: "success" }));
        toast.success(`${key} completed`);
      } else {
        setJobStatuses((s) => ({ ...s, [key]: "error" }));
        toast.error(`${key} failed: ${text}`);
      }
    } catch {
      setJobStatuses((s) => ({ ...s, [key]: "error" }));
      setJobResults((r) => ({ ...r, [key]: "Network error" }));
      toast.error(`${key} failed`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-4">
      <h1 className="mb-3 text-2xl font-bold">Admin Panel</h1>
      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="sync">Airtable Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-3">
          {/* Quarter start date */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Quarter Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="quarter-start"
                  className="flex-1 text-sm font-medium"
                >
                  First Monday of the quarter
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Used to calculate calendar dates from week numbers)
                  </span>
                </label>
                <Input
                  id="quarter-start"
                  type="date"
                  className="w-40"
                  value={data[QUARTER_START_KEY] ?? ""}
                  onChange={(e) => setValue(QUARTER_START_KEY, e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature flags */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {FEATURE_FLAGS.map((flag) => (
                  <label
                    key={flag.key}
                    className="flex cursor-pointer items-center gap-2 rounded-md py-0.5 text-sm hover:bg-muted/30"
                  >
                    <Checkbox
                      checked={data[flag.key] === "true"}
                      onCheckedChange={() =>
                        setValue(
                          flag.key,
                          data[flag.key] === "true" ? "false" : "true",
                        )
                      }
                    />
                    <div>
                      <span className="font-medium">{flag.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {flag.key}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observation counts per position */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Observations Per Round</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {LA_POSITION_OPTIONS.map((pos) => {
                  const key = `${OBSERVATION_COUNT_PREFIX}${pos.value}`;
                  return (
                    <div key={pos.value} className="flex items-center">
                      <label
                        htmlFor={`obs-${pos.value}`}
                        className="flex-1 text-sm font-medium"
                      >
                        {pos.label}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {pos.value}
                        </span>
                      </label>
                      <Input
                        id={`obs-${pos.value}`}
                        type="number"
                        min={0}
                        className="w-20"
                        value={data[key] ?? "0"}
                        onChange={(e) => {
                          const num = parseInt(e.target.value, 10);
                          if (!isNaN(num) && num >= 0)
                            setValue(key, String(num));
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Trigger Airtable sync jobs manually. Run them in order: LAs first,
            then sections, then section assignments.
          </p>
          {CRON_JOBS.map((job) => {
            const status = jobStatuses[job.key] ?? "idle";
            const result = jobResults[job.key];
            return (
              <Card size="sm" key={job.key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{job.label}</CardTitle>
                    <Button
                      size="sm"
                      disabled={status === "running"}
                      onClick={() => runJob(job.key)}
                    >
                      {status === "running" ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : status === "success" ? (
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                      ) : status === "error" ? (
                        <XCircle className="mr-1.5 h-3.5 w-3.5 text-red-500" />
                      ) : null}
                      {status === "running" ? "Running…" : "Run"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {job.description}
                  </p>
                  {result && (
                    <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
                      {result}
                    </pre>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
