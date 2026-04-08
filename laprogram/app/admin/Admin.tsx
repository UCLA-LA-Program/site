"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LA_POSITION_MAP } from "@/lib/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  FEATURE_FLAGS,
  IMAGE_SIZE,
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { fetcher } from "@/lib/utils";
import type { RosterUser } from "@/app/api/admin/roster/route";
import Image from "next/image";

type ConfigData = Record<string, string>;

const CRON_JOBS = [
  {
    key: "init-las",
    label: "Sync LAs",
    description:
      "Fetch LA roster from Airtable and sync users + course assignments.",
  },
  {
    key: "init-sections",
    label: "Sync Sections",
    description: "Fetch sections from Airtable and sync section data.",
  },
  {
    key: "init-section-assignments",
    label: "Sync Section Assignments",
    description:
      "Link LAs to their assigned sections. Run after syncing LAs and sections.",
  },
  {
    key: "process-withdraws",
    label: "Process Withdrawals",
    description: "Process LA withdrawals from Airtable.",
  },
] as const;

type JobStatus = "idle" | "running" | "success" | "error";

export function Admin() {
  const { data, mutate } = useSWR<ConfigData>("/api/config", fetcher);
  const { data: roster } = useSWR<RosterUser[]>("/api/admin/roster", fetcher);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [jobResults, setJobResults] = useState<Record<string, string>>({});

  const [rosterQuery, setRosterQuery] = useState("");
  const [rosterCourse, setRosterCourse] = useState("");
  const [rosterPosition, setRosterPosition] = useState("");
  const [rosterSortKey, setRosterSortKey] = useState<
    "name" | "email" | "courses"
  >("name");
  const [rosterSortDir, setRosterSortDir] = useState<"asc" | "desc">("asc");

  const courseOptions = roster
    ? Array.from(
        new Set(roster.flatMap((u) => u.courses.map((c) => c.course_name))),
      ).sort()
    : [];
  const positionOptions = roster
    ? Array.from(
        new Set(roster.flatMap((u) => u.courses.map((c) => c.position))),
      ).sort()
    : [];

  const filteredRoster = roster
    ? roster
        .filter((u) => {
          const q = rosterQuery.trim().toLowerCase();
          if (
            q &&
            !u.name.toLowerCase().includes(q) &&
            !u.email.toLowerCase().includes(q)
          )
            return false;
          if (
            rosterCourse &&
            !u.courses.some((c) => c.course_name === rosterCourse)
          )
            return false;
          if (
            rosterPosition &&
            !u.courses.some((c) => c.position === rosterPosition)
          )
            return false;
          return true;
        })
        .sort((a, b) => {
          const dir = rosterSortDir === "asc" ? 1 : -1;
          const get = (u: RosterUser) =>
            rosterSortKey === "courses"
              ? u.courses.map((c) => c.course_name).join(",")
              : (u[rosterSortKey] ?? "");
          return get(a).localeCompare(get(b)) * dir;
        })
    : [];

  function toggleRosterSort(key: "name" | "email" | "courses") {
    if (rosterSortKey === key) {
      setRosterSortDir(rosterSortDir === "asc" ? "desc" : "asc");
    } else {
      setRosterSortKey(key);
      setRosterSortDir("asc");
    }
  }

  const sortArrow = (key: "name" | "email" | "courses") =>
    rosterSortKey === key ? (rosterSortDir === "asc" ? " ↑" : " ↓") : "";

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
          <TabsTrigger value="roster">Roster</TabsTrigger>
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

          {/* Observation rounds */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Observation Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 justify-between mb-2">
                <span className="text-sm font-medium shrink-0">
                  Active round
                </span>
                <RadioGroup
                  value={data[OBSERVATION_ACTIVE_ROUND_KEY] ?? "0"}
                  onValueChange={(v) =>
                    setValue(OBSERVATION_ACTIVE_ROUND_KEY, v)
                  }
                  className="flex justify-end gap-4"
                >
                  {[
                    { value: "0", label: "Disabled" },
                    { value: "1", label: "Round 1" },
                    { value: "2", label: "Round 2" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-1.5 text-sm"
                    >
                      <RadioGroupItem value={opt.value} />
                      {opt.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>
              {[1, 2].map((round) => {
                const key = `${OBSERVATION_ROUND_WEEKS_PREFIX}${round}`;
                return (
                  <div key={round} className="flex items-center gap-2">
                    <label
                      htmlFor={`round-weeks-${round}`}
                      className="flex-1 text-sm font-medium"
                    >
                      Round {round} weeks
                      <span className="ml-2 text-xs text-muted-foreground">
                        e.g. 3,4,5
                      </span>
                    </label>
                    <Input
                      id={`round-weeks-${round}`}
                      className="w-32"
                      placeholder="3,4"
                      value={data[key] ?? ""}
                      onChange={(e) => setValue(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster">
          {roster ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Search name or email…"
                  value={rosterQuery}
                  onChange={(e) => setRosterQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Select
                  value={rosterCourse || "all"}
                  onValueChange={(v) => setRosterCourse(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All courses</SelectItem>
                    {courseOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={rosterPosition || "all"}
                  onValueChange={(v) => setRosterPosition(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    {positionOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {LA_POSITION_MAP.get(p) ?? p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(rosterQuery || rosterCourse || rosterPosition) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRosterQuery("");
                      setRosterCourse("");
                      setRosterPosition("");
                    }}
                  >
                    Clear
                  </Button>
                )}
                <span className="ml-auto self-center text-xs text-muted-foreground">
                  {filteredRoster.length} of {roster.length}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Photo</th>
                    <th
                      className="cursor-pointer pb-2 font-medium select-none hover:text-foreground"
                      onClick={() => toggleRosterSort("name")}
                    >
                      Name{sortArrow("name")}
                    </th>
                    <th
                      className="cursor-pointer pb-2 font-medium select-none hover:text-foreground"
                      onClick={() => toggleRosterSort("email")}
                    >
                      Email{sortArrow("email")}
                    </th>
                    <th
                      className="cursor-pointer pb-2 font-medium select-none hover:text-foreground"
                      onClick={() => toggleRosterSort("courses")}
                    >
                      Courses{sortArrow("courses")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-2">
                        {user.image ? (
                          <Image
                            height={IMAGE_SIZE}
                            width={IMAGE_SIZE}
                            src={user.image}
                            alt={user.name}
                            className="h-28 w-28 rounded-md object-cover mr-3"
                          />
                        ) : (
                          <div className="flex h-28 w-28 items-center justify-center rounded-md bg-muted text-xl mr-3 font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        )}
                      </td>
                      <td className="py-2 font-medium">{user.name}</td>
                      <td className="py-2 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {user.courses
                          .map(
                            (c) =>
                              `${c.course_name} (${LA_POSITION_MAP.get(c.position) ?? c.position})`,
                          )
                          .join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading roster…</p>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Trigger Airtable sync jobs manually. Run them in order: LAs first,
            then sections, then section assignments.
          </p>
          <p className="text-2xl font-bold">
            DO NOT TOUCH THESE UNLESS YOU WANT THINGS TO BREAK
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
