"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X, CalendarClock, User, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import type { Position } from "@/types/db";
import { LA_POSITION_OBSERVATION_COUNTS_MAP } from "@/lib/DATES";

// --- Dummy data ---

const CURRENT_WEEK = 5;
const CURRENT_ROUND = 2; // round 1 = wk 3-4, round 2 = wk 5-6, round 3 = wk 7-8, round 4 = wk 9-10

const DAY_ORDER: Record<string, number> = {
  M: 0,
  T: 1,
  W: 2,
  R: 3,
  F: 4,
};

const DAY_FULL: Record<string, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday",
};

type ObservationSlot = {
  id: string;
  la_name: string;
  course: string;
  week: number;
  day: string; // single letter: M, T, W, R, F
  date: string; // e.g. "Apr 28"
  start: number; // minutes from midnight
  end: number;
};

const DUMMY_SLOTS: ObservationSlot[] = [
  {
    id: "1",
    la_name: "Alice Chen",
    course: "CS 31",
    week: 5,
    day: "T",
    date: "Apr 29",
    start: 630,
    end: 690,
  },
  {
    id: "2",
    la_name: "Bob Kim",
    course: "CS 31",
    week: 5,
    day: "T",
    date: "Apr 29",
    start: 600,
    end: 660,
  },
  {
    id: "3",
    la_name: "Carol Diaz",
    course: "CS 32",
    week: 5,
    day: "R",
    date: "May 1",
    start: 810,
    end: 870,
  },
  {
    id: "4",
    la_name: "David Park",
    course: "CS 35L",
    week: 5,
    day: "M",
    date: "Apr 28",
    start: 570,
    end: 630,
  },
  {
    id: "5",
    la_name: "Alice Chen",
    course: "CS 31",
    week: 6,
    day: "T",
    date: "May 6",
    start: 630,
    end: 690,
  },
  {
    id: "6",
    la_name: "David Park",
    course: "CS 35L",
    week: 6,
    day: "M",
    date: "May 5",
    start: 570,
    end: 630,
  },
  {
    id: "7",
    la_name: "Eve Johnson",
    course: "CS 32",
    week: 6,
    day: "R",
    date: "May 8",
    start: 780,
    end: 840,
  },
  {
    id: "8",
    la_name: "Bob Kim",
    course: "CS 31",
    week: 6,
    day: "T",
    date: "May 6",
    start: 600,
    end: 660,
  },
  {
    id: "9",
    la_name: "Carol Diaz",
    course: "CS 32",
    week: 7,
    day: "R",
    date: "May 15",
    start: 810,
    end: 870,
  },
  {
    id: "10",
    la_name: "David Park",
    course: "CS 35L",
    week: 7,
    day: "M",
    date: "May 12",
    start: 540,
    end: 600,
  },
  {
    id: "11",
    la_name: "Bob Kim",
    course: "CS 31",
    week: 7,
    day: "T",
    date: "May 13",
    start: 600,
    end: 660,
  },
  {
    id: "12",
    la_name: "Eve Johnson",
    course: "CS 32",
    week: 8,
    day: "R",
    date: "May 22",
    start: 780,
    end: 840,
  },
  {
    id: "13",
    la_name: "Alice Chen",
    course: "CS 31",
    week: 8,
    day: "T",
    date: "May 20",
    start: 630,
    end: 690,
  },
];

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function SignUp() {
  const { data: positions } = useSWR<Position[]>("/api/la/self", fetcher, {
    suspense: true,
    fallbackData: [],
  });

  // Sum required observations across all positions (take the max per course)
  const requiredPerRound = positions
    ? Math.max(
        ...positions.map(
          (p) => LA_POSITION_OBSERVATION_COUNTS_MAP.get(p.position) ?? 0,
        ),
        0,
      )
    : 0;

  const [planned, setPlanned] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

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

  function confirmSelections() {
    setConfirmed((prev) => {
      const next = new Set(prev);
      for (const id of planned) next.add(id);
      return next;
    });
    setPlanned(new Set());
    // TODO: POST to API
    toast.success("Observations confirmed!");
  }

  const takenIds = new Set([...planned, ...confirmed]);
  const available = DUMMY_SLOTS.filter(
    (s) => !takenIds.has(s.id) && s.week >= CURRENT_WEEK,
  );
  const plannedSlots = DUMMY_SLOTS.filter((s) => planned.has(s.id));
  const confirmedSlots = DUMMY_SLOTS.filter((s) => confirmed.has(s.id));
  const totalSelected = plannedSlots.length + confirmedSlots.length;
  const remaining = Math.max(0, requiredPerRound - totalSelected);

  // Group available slots by week+day, sorted by week then day
  type DayGroup = {
    week: number;
    day: string;
    date: string;
    slots: ObservationSlot[];
  };
  const groupMap = new Map<string, DayGroup>();
  for (const slot of available) {
    const key = `${slot.week}-${slot.day}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        week: slot.week,
        day: slot.day,
        date: slot.date,
        slots: [],
      });
    }
    groupMap.get(key)!.slots.push(slot);
  }
  const dayGroups = [...groupMap.values()].sort((a, b) => {
    if (a.week !== b.week) return a.week - b.week;
    return (DAY_ORDER[a.day] ?? 9) - (DAY_ORDER[b.day] ?? 9);
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-bold">Observation Sign-Ups</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Browse available observation slots and sign up. You need to complete{" "}
        <span className="font-semibold text-foreground">
          {requiredPerRound} observations
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
        <div className="flex-1 min-w-0">
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
                    {group.date}: {DAY_FULL[group.day] ?? group.day}, Week{" "}
                    {group.week}
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
                        <span className="w-16 shrink-0 text-muted-foreground">
                          {slot.course}
                        </span>
                        <span className="flex flex-1 items-center gap-1.5 text-muted-foreground">
                          <CalendarClock className="size-3.5" />
                          {minutesToLabel(slot.start)}–
                          {minutesToLabel(slot.end)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 ml-4"
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
        <div className="w-80 shrink-0">
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
                    {totalSelected} / {requiredPerRound}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, (totalSelected / requiredPerRound) * 100)}%`,
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
                  {confirmedSlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No confirmed observations yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {confirmedSlots.map((slot) => (
                        <div key={slot.id} className="text-sm">
                          <p className="font-medium">{slot.la_name}</p>
                          <p className="text-muted-foreground">
                            {slot.course} &middot; {slot.date}:{" "}
                            {DAY_FULL[slot.day] ?? slot.day}, Week {slot.week}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {minutesToLabel(slot.start)}–
                            {minutesToLabel(slot.end)}
                          </p>
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
                              {slot.course} &middot; {slot.date}:{" "}
                              {DAY_FULL[slot.day] ?? slot.day}, Week {slot.week}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {minutesToLabel(slot.start)}–
                              {minutesToLabel(slot.end)}
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
                    <>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Once confirmed, observations cannot be removed.
                      </p>
                      <Button
                        className="mt-2 w-full"
                        size="sm"
                        onClick={confirmSelections}
                      >
                        <Check className="size-3.5" />
                        Confirm Selections
                      </Button>
                    </>
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
