"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  X,
  CalendarClock,
  User,
  Check,
  MapPin,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { fetcher } from "@/lib/utils";
import {
  QUARTER_START_KEY,
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
} from "@/lib/constants";
import type { Availability } from "@/types/db";

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function weekDayToDate(
  week: string | number,
  day: string,
  quarterStart: Date,
): string {
  const weekNum = typeof week === "string" ? parseInt(week) : week;
  const dayOffset = DAY_ORDER[day] ?? 0;
  const date = new Date(quarterStart);
  date.setDate(date.getDate() + (weekNum - 1) * 7 + dayOffset);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

type MyObservation = {
  id: string;
  observee_name: string;
  observee_image: string | null;
  course_name: string;
  section_name: string;
  day: string;
  week: string;
  time: string;
  location: string;
  ta_name: string | null;
  ta_email: string | null;
};

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function timeRangeLabel(time: string): string {
  const [start, end] = time.split("-");
  return `${minutesToLabel(parseTime(start))}–${minutesToLabel(parseTime(end))}`;
}

type DateTab = { week: string; day: string; label: string };

function buildDateTabs(weeks: string[], quarterStart: Date): DateTab[] {
  const tabs: DateTab[] = [];
  for (const week of weeks.sort((a, b) => parseInt(a) - parseInt(b))) {
    for (const day of DAY_NAMES) {
      tabs.push({
        week,
        day,
        label: weekDayToDate(week, day, quarterStart),
      });
    }
  }
  return tabs;
}

export default function SignUp() {
  const { data: config } = useSWR<Record<string, string>>(
    "/api/config",
    fetcher,
  );
  const quarterStart = config?.[QUARTER_START_KEY]
    ? new Date(config[QUARTER_START_KEY] + "T00:00:00")
    : new Date();
  const toDate = (week: string | number, day: string) =>
    weekDayToDate(week, day, quarterStart);

  const activeRound = parseInt(
    config?.[OBSERVATION_ACTIVE_ROUND_KEY] ?? "0",
    10,
  );

  const { data: openSlots, mutate: mutateOpen } = useSWR<Availability[]>(
    "/api/observation/open",
    fetcher,
  );

  // Build tabs from configured round weeks (show all dates, even empty ones)
  const roundWeeksRaw =
    config?.[`${OBSERVATION_ROUND_WEEKS_PREFIX}${activeRound}`] ?? "";
  const roundWeeks = roundWeeksRaw
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean)
    .sort((a, b) => parseInt(a) - parseInt(b));
  const dateTabs = buildDateTabs(roundWeeks, quarterStart);

  // Count slots per tab
  const slotCounts = new Map<string, number>();
  for (const slot of openSlots ?? []) {
    const key = `${slot.week}-${slot.day}`;
    slotCounts.set(key, (slotCounts.get(key) ?? 0) + 1);
  }

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const selectedTab =
    activeTab ??
    (dateTabs.length > 0 ? `${dateTabs[0].week}-${dateTabs[0].day}` : "");
  const { data: myObservations, mutate: mutateObservations } = useSWR<
    MyObservation[]
  >("/api/observation", fetcher);

  const [pendingAdds, setPendingAdds] = useState<Set<string>>(new Set());
  const [pendingRemoves, setPendingRemoves] = useState<Set<string>>(new Set());

  const hasPendingChanges = pendingAdds.size > 0 || pendingRemoves.size > 0;

  function addSlot(id: string) {
    setPendingAdds((prev) => new Set(prev).add(id));
  }

  function undoAdd(id: string) {
    setPendingAdds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function markForRemoval(id: string) {
    setPendingRemoves((prev) => new Set(prev).add(id));
  }

  function undoRemoval(id: string) {
    setPendingRemoves((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function confirmChanges() {
    let addSuccess = 0;
    let removeSuccess = 0;

    for (const id of pendingRemoves) {
      try {
        const res = await fetch(`/api/observation/${id}`, { method: "DELETE" });
        if (res.ok) removeSuccess++;
      } catch {
        // continue
      }
    }

    for (const availabilityId of pendingAdds) {
      try {
        const res = await fetch("/api/observation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ availability_id: availabilityId }),
        });
        if (res.ok) addSuccess++;
      } catch {
        // continue
      }
    }

    setPendingAdds(new Set());
    setPendingRemoves(new Set());
    await Promise.all([mutateObservations(), mutateOpen()]);

    const parts = [];
    if (addSuccess > 0) parts.push(`${addSuccess} added`);
    if (removeSuccess > 0) parts.push(`${removeSuccess} removed`);
    if (parts.length > 0) {
      toast.success(`Observations updated: ${parts.join(", ")}.`);
    } else {
      toast.error("Failed to update observations.");
    }
  }

  // Parse selected tab
  const [selWeek, selDay] = selectedTab.split("-", 2) as [string, string];

  // Filter slots for the active tab, excluding pending adds
  const available = (openSlots ?? []).filter(
    (s) => s.week === selWeek && s.day === selDay && !pendingAdds.has(s.id),
  );
  const pendingAddSlots = (openSlots ?? []).filter((s) =>
    pendingAdds.has(s.id),
  );

  const activeConfirmed = (myObservations ?? []).filter(
    (o) => !pendingRemoves.has(o.id),
  );
  const pendingRemoveSlots = (myObservations ?? []).filter((o) =>
    pendingRemoves.has(o.id),
  );

  if (!openSlots || !myObservations) {
    return <></>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10 animate-fade-up">
      <h1 className="mb-2 text-2xl font-bold">
        Observation Sign-Ups{activeRound > 0 && ` — Round ${activeRound}`}
      </h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Refer to{" "}
        <a
          href="https://docs.google.com/document/d/17pDksikMm5NBOjJuHOeH4i9YGslF1A9HYFr879N1814/edit?tab=t.0"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline text-primary"
        >
          Feedback and Growth
        </a>{" "}
        to find out how many observations you need to complete.
      </p>
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: available slots */}
        <div className="min-w-0 flex-1">
          {dateTabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No observation dates are currently available.
            </p>
          ) : (
            <Tabs value={selectedTab} onValueChange={setActiveTab}>
              <div className="mb-4 space-y-2">
                {roundWeeks.map((week) => (
                  <TabsList key={week}>
                    <span className="px-2 text-xs text-muted-foreground">
                      Wk {week}
                    </span>
                    {dateTabs
                      .filter((tab) => tab.week === week)
                      .map((tab) => {
                        const count =
                          slotCounts.get(`${tab.week}-${tab.day}`) ?? 0;
                        return (
                          <TabsTrigger
                            key={`${tab.week}-${tab.day}`}
                            value={`${tab.week}-${tab.day}`}
                          >
                            {tab.label} ({count})
                          </TabsTrigger>
                        );
                      })}
                  </TabsList>
                ))}
              </div>
              {available.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No slots available for this date.
                </p>
              ) : (
                <div className="space-y-2">
                  {available
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 font-medium">
                              <User className="size-3.5 text-muted-foreground" />
                              {slot.la_name}
                            </span>
                            <span className="text-muted-foreground">
                              {slot.course_name} {slot.section_name}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarClock className="size-3" />
                              {timeRangeLabel(slot.time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {slot.location}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-4 shrink-0"
                          onClick={() => addSlot(slot.id)}
                        >
                          <Plus className="size-3.5" />
                          Sign up
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </Tabs>
          )}
        </div>

        {/* Sidebar: confirmed + pending changes (top on mobile, right on desktop) */}
        <div className="order-first w-full shrink-0 lg:order-last lg:w-[32rem]">
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Confirmed box */}
            <Card>
              <CardHeader>
                <CardTitle>Confirmed Observations</CardTitle>
              </CardHeader>
              <CardContent>
                {activeConfirmed.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No confirmed observations yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeConfirmed.map((obs) => (
                      <div
                        key={obs.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="flex min-w-0 gap-3">
                          <div className="size-20 shrink-0 overflow-hidden rounded-sm border bg-muted">
                            {obs.observee_image ? (
                              <Image
                                src={obs.observee_image}
                                alt={obs.observee_name}
                                width={300}
                                height={300}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound
                                className="h-full w-full text-muted-foreground"
                                strokeWidth={1}
                              />
                            )}
                          </div>
                          <div className="min-w-0 text-sm">
                            <p className="font-medium">{obs.observee_name}</p>
                            <p className="text-muted-foreground">
                              {obs.course_name} {obs.section_name} &middot;{" "}
                              {toDate(obs.week, obs.day)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {timeRangeLabel(obs.time)} &middot; {obs.location}
                            </p>
                            {obs.ta_name && (
                              <p className="text-xs text-muted-foreground">
                                TA: {obs.ta_name}
                                {obs.ta_email && <span> ({obs.ta_email})</span>}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => markForRemoval(obs.id)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending changes box */}
            {hasPendingChanges && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>Pending Changes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pending adds */}
                  {pendingAddSlots.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-medium text-green-600">
                        Adding
                      </h3>
                      <div className="space-y-3">
                        {pendingAddSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 text-sm">
                              <p className="font-medium">{slot.la_name}</p>
                              <p className="text-muted-foreground">
                                {slot.course_name} {slot.section_name} &middot;{" "}
                                {toDate(slot.week, slot.day)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {timeRangeLabel(slot.time)} &middot;{" "}
                                {slot.location}
                              </p>
                            </div>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => undoAdd(slot.id)}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending removes */}
                  {pendingRemoveSlots.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-medium text-red-600">
                        Removing
                      </h3>
                      <div className="space-y-3">
                        {pendingRemoveSlots.map((obs) => (
                          <div
                            key={obs.id}
                            className="flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 text-sm">
                              <p className="font-medium line-through opacity-60">
                                {obs.observee_name}
                              </p>
                              <p className="text-muted-foreground line-through opacity-60">
                                {obs.course_name} {obs.section_name} &middot;{" "}
                                {toDate(obs.week, obs.day)}
                              </p>
                              <p className="text-xs text-muted-foreground line-through opacity-60">
                                {timeRangeLabel(obs.time)} &middot;{" "}
                                {obs.location}
                              </p>
                            </div>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => undoRemoval(obs.id)}
                              title="Undo removal"
                            >
                              <Plus className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Button className="w-full" size="sm" onClick={confirmChanges}>
                    <Check className="size-3.5" />
                    Confirm Changes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
