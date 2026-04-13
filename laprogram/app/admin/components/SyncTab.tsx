"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const CRON_JOBS = [
  {
    key: "init-las",
    label: "Sync LAs",
    description:
      "Fetch LAs and their courses. Needs to be run when an LA/their course is missing from the system.",
    requires: [] as string[],
  },
  {
    key: "init-sections",
    label: "Sync Sections",
    description:
      "Fetch section data. Needs to be run when a section is missing or has outdated information.",
    requires: ["init-las"],
  },
  {
    key: "init-section-assignments",
    label: "Sync Section Assignments",
    description:
      "Link LAs to sections. Needs to be run when section assignments are incorrect.",
    requires: ["init-las", "init-sections"],
  },
  {
    key: "process-withdraws",
    label: "Process Withdrawals",
    description: "Process LA withdrawals from Airtable. Currently disabled.",
    requires: ["DISABLED"],
  },
] as const;

type JobStatus = "idle" | "running" | "success" | "error";

export function SyncTab() {
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [jobResults, setJobResults] = useState<Record<string, string>>({});

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
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Trigger Airtable sync jobs manually. These can be dangerous: do not
        execute without permission.
      </p>
      {CRON_JOBS.map((job) => {
        const status = jobStatuses[job.key] ?? "idle";
        const result = jobResults[job.key];
        const prereqsMet = job.requires.every(
          (r) => jobStatuses[r] === "success",
        );
        const isDisabled = status === "running" || !prereqsMet;
        return (
          <Card size="sm" key={job.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{job.label}</CardTitle>
                <Button
                  size="sm"
                  disabled={isDisabled}
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
              <p className="text-sm text-muted-foreground">{job.description}</p>
              {job.requires.length > 0 && job.requires[0] !== "DISABLED" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Requires:{" "}
                  {job.requires
                    .map((r) => CRON_JOBS.find((j) => j.key === r)?.label ?? r)
                    .join(", ")}
                </p>
              )}
              {result && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
                  {result}
                </pre>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
