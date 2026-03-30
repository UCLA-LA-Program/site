"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Check, Loader2, Lock, Users } from "lucide-react";
import ContactUs from "@/components/ContactUs";

// dummy data with incorrect format (replace once SQL formatting is locked down)

type CourseSection = {
  course_name: string;
  position: string;
  section_day: string;
  section_start: number; // minutes from midnight
  section_end: number; // minutes from midnight
};

const DUMMY_COURSES: CourseSection[] = [
  {
    course_name: "CS 35L",
    position: "new",
    section_day: "Monday",
    section_start: 540, // 9:00 AM
    section_end: 660, // 11:00 AM
  },
  {
    course_name: "CS 31",
    position: "returner",
    section_day: "Tuesday",
    section_start: 600, // 10:00 AM
    section_end: 720, // 12:00 PM
  },
  {
    course_name: "CS 32",
    position: "new",
    section_day: "Thursday",
    section_start: 780, // 1:00 PM
    section_end: 900, // 3:00 PM
  },
];

const WEEKS = [3, 4, 5, 6, 7, 8, 9, 10] as const;
const CURRENT_WEEK = 5; // dummy
const STEP = 10; // minutes
const MIN_RANGE = 30; // minutes

// Dummy signup counts per course per week
const DUMMY_SIGNUPS: Record<string, Record<number, number>> = {
  "CS 35L": { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
  "CS 31": { 3: 2, 4: 1, 5: 3, 6: 0, 7: 1, 8: 0, 9: 0, 10: 0 },
  "CS 32": { 3: 1, 4: 0, 5: 0, 6: 0, 7: 0, 8: 2, 9: 0, 10: 0 },
};

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

type WeekSlot = {
  selected: boolean;
  timeRange: [number, number];
};

type CourseSchedule = {
  weekSlots: Map<number, WeekSlot>;
  timeRange: [number, number]; // master slider position
};

function buildInitialSchedules() {
  const map = new Map<string, CourseSchedule>();
  for (const course of DUMMY_COURSES) {
    const weekSlots = new Map<number, WeekSlot>();
    for (const week of WEEKS) {
      const signups = DUMMY_SIGNUPS[course.course_name]?.[week] ?? 0;
      const isPast = week < CURRENT_WEEK;
      // Most weeks are selected; only leave week 10 unchecked for variety
      if (isPast) {
        weekSlots.set(week, {
          selected: true,
          timeRange: [course.section_start + 30, course.section_end],
        });
      } else {
        weekSlots.set(week, {
          selected: week <= 9,
          timeRange: [course.section_start + 45, course.section_end],
        });
      }
    }
    map.set(course.course_name, {
      weekSlots,
      timeRange: [course.section_start + 45, course.section_end],
    });
  }
  return map;
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<Map<string, CourseSchedule>>(
    buildInitialSchedules,
  );

  const [showPast, setShowPast] = useState<Set<string>>(new Set());

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const save = useCallback((data: Map<string, CourseSchedule>) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    if (resetTimeout.current) clearTimeout(resetTimeout.current);

    setSaveState("saving");
    saveTimeout.current = setTimeout(() => {
      // TODO: POST to API with serialized data
      void data;
      setSaveState("saved");
      resetTimeout.current = setTimeout(() => setSaveState("idle"), 2000);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    };
  }, []);

  const toggleWeek = useCallback(
    (courseName: string, week: number) => {
      setSchedules((prev) => {
        const next = new Map(prev);
        const entry = { ...next.get(courseName)! };
        const weekSlots = new Map(entry.weekSlots);
        const slot = weekSlots.get(week)!;
        weekSlots.set(week, { ...slot, selected: !slot.selected });
        entry.weekSlots = weekSlots;
        next.set(courseName, entry);
        save(next);
        return next;
      });
    },
    [save],
  );

  const setTimeRange = useCallback((courseName: string, value: number[]) => {
    const course = DUMMY_COURSES.find((c) => c.course_name === courseName)!;
    let [start, end] = value;

    if (end - start < MIN_RANGE) {
      if (end - MIN_RANGE >= course.section_start) {
        start = end - MIN_RANGE;
      } else {
        end = start + MIN_RANGE;
      }
    }

    setSchedules((prev) => {
      const next = new Map(prev);
      const entry = { ...next.get(courseName)! };
      entry.timeRange = [start, end];

      // Update all current/future weeks
      const weekSlots = new Map(entry.weekSlots);
      for (const week of WEEKS) {
        if (week >= CURRENT_WEEK) {
          const slot = weekSlots.get(week)!;
          weekSlots.set(week, { ...slot, timeRange: [start, end] });
        }
      }
      entry.weekSlots = weekSlots;

      next.set(courseName, entry);
      return next;
    });
  }, []);

  const commitTimeRange = useCallback(
    (courseName: string, value: number[]) => {
      setTimeRange(courseName, value);
      setSchedules((prev) => {
        save(prev);
        return prev;
      });
    },
    [setTimeRange, save],
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Schedule Observations</h1>
          <p className="mb-2 text-sm">Instructions:</p>
          <ul className="mb-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              Check/uncheck weeks depending on if you will be available to be
              observed during that week.
            </li>
            <li>
              Edit your available timeslot during your section using the{" "}
              <span className="font-semibold">timeslot</span> slider. Any
              changes will apply to all future weeks.
            </li>
          </ul>
          <p className="mb-2 text-sm">Notes:</p>
          <ul className="mb-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              You will be <span className="font-bold">unable</span> to change
              your available timeslot if anyone has signed up to observe you for
              the present week or a future week.
            </li>
            <li>
              You will be <span className="font-bold">able</span> to change your
              available timeslot if no present/future week has a observation
              sign up (i.e. between/before observation rounds).
            </li>
            <li>
              You will be able to check/uncheck future weeks if no one has
              signed up to observe that week.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            If you run into any issues, please refer to the syllabus and/or{" "}
            <ContactUs /> for technical problems.
          </p>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === "saving" && (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving…
            </>
          )}
          {saveState === "saved" && (
            <>
              <Check className="size-3.5 text-green-600" />
              Saved
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {DUMMY_COURSES.map((course) => {
          const schedule = schedules.get(course.course_name)!;

          const showingPast = showPast.has(course.course_name);
          const visibleWeeks = WEEKS.filter(
            (w) => showingPast || w >= CURRENT_WEEK,
          );

          return (
            <Card key={course.course_name}>
              <CardHeader>
                <CardTitle>{course.course_name}</CardTitle>
                <CardDescription>
                  {course.section_day} &middot;{" "}
                  {minutesToLabel(course.section_start)}–
                  {minutesToLabel(course.section_end)}
                </CardDescription>
                <CardAction>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={showingPast}
                      onCheckedChange={() =>
                        setShowPast((prev) => {
                          const next = new Set(prev);
                          if (next.has(course.course_name)) {
                            next.delete(course.course_name);
                          } else {
                            next.add(course.course_name);
                          }
                          return next;
                        })
                      }
                    />
                    Show previous weeks
                  </label>
                </CardAction>
              </CardHeader>
              <CardContent>
                {(() => {
                  const hasAnyFutureSignups = WEEKS.some(
                    (w) =>
                      w >= CURRENT_WEEK &&
                      (DUMMY_SIGNUPS[course.course_name]?.[w] ?? 0) > 0,
                  );

                  return (
                    <>
                      {/* Master slider or locked message */}
                      {hasAnyFutureSignups ? (
                        <p className="mb-4 px-3 text-sm text-muted-foreground">
                          <Lock className="mr-1.5 inline size-3.5 -translate-y-px" />
                          Timeslot cannot be changed while a present or future
                          week has observation sign-ups.
                        </p>
                      ) : (
                        <div className="mb-4 flex items-center gap-3 px-3">
                          <span className="flex shrink-0 items-center gap-2 text-sm font-medium">
                            <span className="size-4" />
                            <span className="w-16">Timeslot</span>
                          </span>
                          <span className="w-16 shrink-0" />
                          <div className="flex flex-1 items-center gap-3">
                            <Slider
                              min={course.section_start}
                              max={course.section_end}
                              step={STEP}
                              value={schedule.timeRange}
                              onValueChange={(v) =>
                                setTimeRange(course.course_name, v)
                              }
                              onValueCommit={(v) =>
                                commitTimeRange(course.course_name, v)
                              }
                              minStepsBetweenThumbs={MIN_RANGE / STEP}
                            />
                            <span className="w-[10.5rem] shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                              {minutesToLabel(schedule.timeRange[0])}–
                              {minutesToLabel(schedule.timeRange[1])}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        {visibleWeeks.map((week) => {
                          const slot = schedule.weekSlots.get(week)!;
                          const isPast = week < CURRENT_WEEK;
                          const signups =
                            DUMMY_SIGNUPS[course.course_name]?.[week] ?? 0;
                          const hasSignups = signups > 0;
                          const isLocked = isPast || hasSignups;

                          return (
                            <div
                              key={week}
                              className={`flex items-center gap-3 rounded-md px-3 py-0.5 text-sm ${
                                isPast
                                  ? "opacity-40"
                                  : hasSignups
                                    ? "bg-muted/40"
                                    : ""
                              }`}
                            >
                              <label
                                className={`flex shrink-0 items-center gap-2 ${
                                  isLocked ? "" : "cursor-pointer"
                                }`}
                              >
                                <Checkbox
                                  checked={slot.selected}
                                  disabled={isLocked}
                                  onCheckedChange={() =>
                                    toggleWeek(course.course_name, week)
                                  }
                                />
                                <span className="w-16">Week {week}</span>
                              </label>

                              <span className="flex w-16 shrink-0 items-center gap-1.5">
                                {hasSignups && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    <Users className="size-3" />
                                    {signups}
                                  </span>
                                )}
                                {hasSignups && !isPast && (
                                  <Lock className="size-3 text-muted-foreground" />
                                )}
                              </span>

                              {/* Per-week slider (always disabled, display only) */}
                              {slot.selected && (
                                <div className="flex flex-1 items-center gap-3">
                                  <Slider
                                    min={course.section_start}
                                    max={course.section_end}
                                    step={STEP}
                                    value={slot.timeRange}
                                    disabled
                                    showThumbs={false}
                                  />
                                  <span className="w-[10.5rem] shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                                    {minutesToLabel(slot.timeRange[0])}–
                                    {minutesToLabel(slot.timeRange[1])}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
