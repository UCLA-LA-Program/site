"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X, CalendarClock, User, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/utils";
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

type MyObservation = {
  id: string;
  observee_name: string;
  course_name: string;
  day: string;
  week: string;
  time: string;
  location: string;
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
  const {
    data: openSlots,
    mutate: mutateOpen,
  } = useSWR<Availability[]>("/api/observation/open", fetcher);
  const {
    data: myObservations,
    mutate: mutateObservations,
  } = useSWR<MyObservation[]>("/api/observation", fetcher);

  const [planned, setPlanned] = useState<Set<string>>(new Set());

  const confirmedIds = new Set(myObservations?.map((o) => o.id) ?? []);

  function addSlot(id: string) {
    setPlanned((prev) => new Set(prev).add(id));
  }

  function removePlanned(id: string) {
    setPlanned((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function removeConfirmed(id: string) {
    try {
      const res = await fetch(`/api/observation/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await Promise.all([mutateObservations(), mutateOpen()]);
      toast.success("Observation removed.");
    } catch {
      toast.error("Failed to remove observation.");
    }
  }

  async function confirmSelections() {
    const ids = [...planned];
    let success = 0;
    for (const availabilityId of ids) {
      try {
        const res = await fetch("/api/observation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ availability_id: availabilityId }),
        });
        if (res.ok) success++;
      } catch {
        // continue with remaining
      }
    }
    setPlanned(new Set());
    await Promise.all([mutateObservations(), mutateOpen()]);
    if (success > 0) {
      toast.success(`${success} observation${success !== 1 ? "s" : ""} confirmed!`);
    } else {
      toast.error("Failed to confirm observations.");
    }
  }

  const loading = !openSlots || !myObservations;
  const totalSelected = planned.size + (myObservations?.length ?? 0);
  const remaining = Math.max(0, REQUIRED_PER_ROUND - totalSelected);

  // Filter out slots that are already planned
  const available = (openSlots ?? []).filter((s) => !planned.has(s.id));
  const plannedSlots = (openSlots ?? []).filter((s) => planned.has(s.id));

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
      <p className="mb-4 text-sm text-muted-foreground">
        Browse available observation slots and sign up. You need to complete{" "}
        <span className="font-semibold text-foreground">
          {REQUIRED_PER_ROUND} observations
        </span>{" "}
        per round.
      </p>
      <p className="mb-8 text-lg">
        You are signing up for{" "}
        <span className="font-semibold">Round {CURRENT_ROUND}</span>{" "}
        observations.
      </p>

      <div className="flex gap-8">
        {/* Left: available slots */}
        <div className="min-w-0 flex-1">
          <h2 className="mb-4 text-lg font-semibold">Available Slots</h2>
          {dayGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No observation slots are currently available.
            </p>
          ) : (
            <div className="space-y-6">
              {dayGroups.map((group) => (
                <div key={`${group.week}-${group.day}`}>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    {group.day}, Week {group.week}
                  </h3>
                  <div className="space-y-2">
                    {group.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center rounded-lg border px-4 py-3 text-sm"
                      >
                        <div className="flex w-36 shrink-0 items-center gap-2">
                          <User className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">{slot.la_name}</span>
                        </div>
                        <span className="w-20 shrink-0 text-muted-foreground">
                          {slot.course_name}
                        </span>
                        <span className="flex flex-1 items-center gap-1.5 text-muted-foreground">
                          <CalendarClock className="size-3.5" />
                          {timeRangeLabel(slot.time)}
                        </span>
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

        {/* Right: signed-up sidebar */}
        <div className="w-96 shrink-0">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>Your Observations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Round {CURRENT_ROUND}
                  </span>
                  <span className="font-medium">
                    {totalSelected} / {REQUIRED_PER_ROUND}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, (totalSelected / REQUIRED_PER_ROUND) * 100)}%`,
                    }}
                  />
                </div>
                {remaining > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {remaining} more observation{remaining !== 1 && "s"} needed
                    this round.
                  </p>
                ) : (
                  <p className="text-xs font-medium text-green-600">
                    You&rsquo;ve met the requirement for this round!
                  </p>
                )}

                <Separator />

                {/* Confirmed */}
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <Lock className="size-3.5" />
                    Confirmed
                  </h3>
                  {myObservations.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No confirmed observations yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {myObservations.map((obs) => (
                        <div
                          key={obs.id}
                          className="flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0 text-sm">
                            <p className="font-medium">{obs.observee_name}</p>
                            <p className="text-muted-foreground">
                              {obs.course_name} &middot; {obs.day}, Week{" "}
                              {obs.week}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {timeRangeLabel(obs.time)}
                            </p>
                          </div>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => removeConfirmed(obs.id)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Planned */}
                <div>
                  <h3 className="mb-2 text-sm font-medium">Planned</h3>
                  {plannedSlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Add slots from the left to plan your observations.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {plannedSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0 text-sm">
                            <p className="font-medium">{slot.la_name}</p>
                            <p className="text-muted-foreground">
                              {slot.course_name} &middot; {slot.day}, Week{" "}
                              {slot.week}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {timeRangeLabel(slot.time)}
                            </p>
                          </div>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => removePlanned(slot.id)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {plannedSlots.length > 0 && (
                    <Button
                      className="mt-2 w-full"
                      size="sm"
                      onClick={confirmSelections}
                    >
                      <Check className="size-3.5" />
                      Confirm Selections
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
