"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X, CalendarClock, User, Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/utils";
import { QUARTER_START_KEY } from "@/lib/constants";
import type { Availability } from "@/types/db";

const CURRENT_ROUND = 2;
const REQUIRED_PER_ROUND = 2;

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function weekDayToDate(
  week: string | number,
  day: string,
  quarterStart: Date,
): string {
  const weekNum = typeof week === "string" ? parseInt(week) : week;
  const dayOffset = DAY_ORDER[day] ?? 0;
  const date = new Date(quarterStart);
  date.setDate(date.getDate() + (weekNum - 1) * 7 + dayOffset);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

type MyObservation = {
  id: string;
  observee_name: string;
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

  const { data: openSlots, mutate: mutateOpen } = useSWR<Availability[]>(
    "/api/observation/open",
    fetcher,
  );
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

  const loading = !openSlots || !myObservations;

  const confirmedCount = myObservations?.length ?? 0;

  // Filter available: exclude pending adds
  const available = (openSlots ?? []).filter((s) => !pendingAdds.has(s.id));
  const pendingAddSlots = (openSlots ?? []).filter((s) =>
    pendingAdds.has(s.id),
  );

  // Confirmed observations minus pending removes
  const activeConfirmed = (myObservations ?? []).filter(
    (o) => !pendingRemoves.has(o.id),
  );
  const pendingRemoveSlots = (myObservations ?? []).filter((o) =>
    pendingRemoves.has(o.id),
  );

  // Group available slots by week+day
  type DayGroup = {
    week: string;
    day: string;
    slots: Availability[];
  };
  const groupMap = new Map<string, DayGroup>();
  for (const slot of available) {
    const key = `${slot.week}-${slot.day}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, { week: slot.week, day: slot.day, slots: [] });
    }
    groupMap.get(key)!.slots.push(slot);
  }
  const dayGroups = [...groupMap.values()].sort((a, b) => {
    const weekDiff = parseInt(a.week) - parseInt(b.week);
    if (weekDiff !== 0) return weekDiff;
    return (DAY_ORDER[a.day] ?? 9) - (DAY_ORDER[b.day] ?? 9);
  });

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        <h1 className="mb-2 text-2xl font-bold">Observation Sign-Ups</h1>
        <p className="text-sm text-muted-foreground">Loading slots...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-bold">Observation Sign-Ups</h1>
      <p className="mb-5 text-lg">
        You are signing up for{" "}
        <span className="font-semibold">Round {CURRENT_ROUND}</span>{" "}
        observations.{" "}
        <span className="text-sm text-muted-foreground">
          ({confirmedCount}/{REQUIRED_PER_ROUND} confirmed)
        </span>
      </p>

      <div className="flex gap-8">
        {/* Left: available slots */}
        <div className="min-w-0 flex-1">
          {dayGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No observation slots are currently available.
            </p>
          ) : (
            <div className="space-y-6">
              {dayGroups.map((group) => (
                <div key={`${group.week}-${group.day}`}>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    {toDate(group.week, group.day)}
                  </h3>
                  <div className="space-y-2">
                    {group.slots.map((slot) => (
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
                            <span className="text-muted-foreground">
                              {toDate(slot.week, slot.day)}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-96 shrink-0">
          <div className="sticky top-24 space-y-4">
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
                        className="flex items-start justify-between gap-2"
                      >
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
