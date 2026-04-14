"use client";

import { useState, useEffect } from "react";
import useSWRImmutable from "swr/immutable";
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
import { CheckCircle2, Loader2, Lock, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ContactUs } from "@/components/ContactUs";
import { fetcher } from "@/lib/utils";

const WEEKS = [3, 4, 5, 6, 7, 8, 9, 10] as const;
const STEP = 10; // minutes
const MIN_RANGE = 30; // minutes

type SectionData = {
  section_id: string;
  course_name: string;
  section_name: string;
  day: string;
  time: string; // e.g. "9:00-9:50"
  location: string;
  position: string;
};

type AvailabilityRow = {
  id: string;
  section_id: string;
  time: string; // e.g. "9:10-9:40"
  week: string;
  status: "open" | "hidden" | "taken";
};

type WeekSlot = {
  selected: boolean;
  timeRange: [number, number];
};

type CourseSchedule = {
  sectionId: string;
  sectionStart: number;
  sectionEnd: number;
  day: string;
  position: string;
  weekSlots: Map<number, WeekSlot>;
  timeRange: [number, number];
};

function parseTime(timeStr: string): number {
  const match = timeStr.match(/^(\d+):(\d+)(am|pm)?$/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3]?.toLowerCase();
  if (period === "pm" && h !== 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  return h * 60 + m;
}

function parseSectionTime(time: string): [number, number] {
  const [start, end] = time.split("-");
  return [parseTime(start), parseTime(end)];
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function buildSectionSchedule(
  section: SectionData,
  availability: AvailabilityRow[],
  currentWeek: number,
): CourseSchedule {
  const [sectionStart, sectionEnd] = parseSectionTime(section.time);
  const sectionAvail = availability.filter(
    (a) => a.section_id === section.section_id,
  );

  const weekSlots = new Map<number, WeekSlot>();
  let defaultStart = sectionEnd - 30;
  let defaultEnd = sectionEnd;

  const futureAvail = sectionAvail.find((a) => parseInt(a.week) >= currentWeek);
  if (futureAvail) {
    const [s, e] = futureAvail.time.split("-").map(parseTime);
    defaultStart = s;
    defaultEnd = e;
  }

  for (const week of WEEKS) {
    const weekAvail = sectionAvail.find((a) => a.week === String(week));
    if (weekAvail) {
      const [s, e] = weekAvail.time.split("-").map(parseTime);
      weekSlots.set(week, { selected: true, timeRange: [s, e] });
    } else {
      weekSlots.set(week, {
        selected: false,
        timeRange: [defaultStart, defaultEnd],
      });
    }
  }

  return {
    sectionId: section.section_id,
    sectionStart,
    sectionEnd,
    day: section.day,
    position: section.position,
    weekSlots,
    timeRange: [defaultStart, defaultEnd],
  };
}

function buildSchedules(
  sections: SectionData[],
  availability: AvailabilityRow[],
  currentWeek: number,
): Map<string, CourseSchedule> {
  const map = new Map<string, CourseSchedule>();
  for (const section of sections) {
    map.set(
      section.section_id,
      buildSectionSchedule(section, availability, currentWeek),
    );
  }
  return map;
}

function signupCountsFromAvailability(
  availability: AvailabilityRow[],
): Map<string, Map<number, number>> {
  // section_id -> week -> count of 'taken'
  const counts = new Map<string, Map<number, number>>();
  for (const a of availability) {
    if (a.status !== "taken") continue;
    if (!counts.has(a.section_id)) counts.set(a.section_id, new Map());
    const weekMap = counts.get(a.section_id)!;
    const week = parseInt(a.week);
    weekMap.set(week, (weekMap.get(week) ?? 0) + 1);
  }
  return counts;
}

export function Schedule({ currentWeek }: { currentWeek: number }) {
  const { data: sections } = useSWRImmutable<SectionData[]>(
    "/api/sections",
    fetcher,
  );
  const { data: availability, mutate: mutateAvailability } = useSWRImmutable<
    AvailabilityRow[]
  >("/api/availability", fetcher);

  const [schedules, setSchedules] = useState<Map<
    string,
    CourseSchedule
  > | null>(null);
  const [showPast, setShowPast] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  function toggleShowPast(sectionId: string) {
    setShowPast((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  const hasDirty = dirty.size > 0;
  useEffect(() => {
    if (!hasDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasDirty]);

  // Build schedules once data loads
  if (sections && availability && !schedules) {
    setSchedules(buildSchedules(sections, availability, currentWeek));
  }

  const signupCounts = availability
    ? signupCountsFromAvailability(availability)
    : new Map<string, Map<number, number>>();

  async function saveSection(sectionId: string) {
    const schedule = schedules?.get(sectionId);
    if (!schedule) return;

    setSaving((prev) => new Set(prev).add(sectionId));
    const weeks: { week: string; time: string }[] = [];
    for (const [week, slot] of schedule.weekSlots) {
      if (slot.selected) {
        const timeStr = `${minutesToTimeStr(slot.timeRange[0])}-${minutesToTimeStr(slot.timeRange[1])}`;
        weeks.push({ week: String(week), time: timeStr });
      }
    }

    try {
      await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_id: sectionId, weeks }),
      });
      const freshAvailability = await mutateAvailability();
      if (sections && freshAvailability) {
        const section = sections.find((s) => s.section_id === sectionId);
        if (section) {
          setSchedules((prev) => {
            const next = new Map(prev);
            next.set(
              sectionId,
              buildSectionSchedule(section, freshAvailability, currentWeek),
            );
            return next;
          });
        }
      }
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
      setSaved((prev) => new Set(prev).add(sectionId));
      setTimeout(() => {
        setSaved((prev) => {
          const next = new Set(prev);
          next.delete(sectionId);
          return next;
        });
      }, 2000);
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }
  }

  function markDirty(sectionId: string) {
    setDirty((prev) => new Set(prev).add(sectionId));
  }

  function toggleWeek(sectionId: string, week: number) {
    setSchedules((prev) => {
      if (!prev) return prev;
      const next = new Map(prev);
      const entry = { ...next.get(sectionId)! };
      const weekSlots = new Map(entry.weekSlots);
      const slot = weekSlots.get(week)!;
      weekSlots.set(week, { ...slot, selected: !slot.selected });
      entry.weekSlots = weekSlots;
      next.set(sectionId, entry);
      return next;
    });
    markDirty(sectionId);
  }

  function setTimeRange(sectionId: string, value: number[]) {
    setSchedules((prev) => {
      if (!prev) return prev;
      const next = new Map(prev);
      const entry = { ...next.get(sectionId)! };
      let [start, end] = value;

      if (end - start < MIN_RANGE) {
        if (end - MIN_RANGE >= entry.sectionStart) {
          start = end - MIN_RANGE;
        } else {
          end = start + MIN_RANGE;
        }
      }

      entry.timeRange = [start, end];

      const weekSlots = new Map(entry.weekSlots);
      for (const week of WEEKS) {
        if (week >= currentWeek) {
          const slot = weekSlots.get(week)!;
          weekSlots.set(week, { ...slot, timeRange: [start, end] });
        }
      }
      entry.weekSlots = weekSlots;
      next.set(sectionId, entry);
      return next;
    });
    markDirty(sectionId);
  }

  if (!sections || !availability || !schedules) {
    return <></>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-10 animate-fade-up">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Schedule Observations</h1>
          <p className="mb-2 text-sm">Instructions:</p>
          <ul className="mb-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              Check/uncheck your availability per week and edit your available
              timeslot per section using the slider. Any changes will apply to
              all future weeks. You can edit in 10 minute increments with a
              required minimum of 30 minutes.
            </li>
            <li>Press &ldquo;Save Changes&rdquo; to save your availability.</li>
          </ul>
          <p className="mb-2 text-sm">Notes:</p>
          <ul className="mb-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              You will be unable to change your available timeslot if anyone has
              signed up to observe you for the present week or a future week.
            </li>
            <li>
              You will be unable to check/uncheck future weeks if anyone has
              signed up to observe that week.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            If you run into any issues, please refer to the syllabus and/or{" "}
            <ContactUs /> for technical problems.
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You have no section assignments. If this is an error, please{" "}
          <ContactUs />.
        </p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            const key = section.section_id;
            const schedule = schedules.get(key);
            if (!schedule) return null;

            const sectionSignups = signupCounts.get(key);
            const showingPast = showPast.has(key);
            const visibleWeeks = WEEKS.filter(
              (w) => showingPast || w >= currentWeek,
            );

            const hasAnyFutureSignups = WEEKS.some(
              (w) => w >= currentWeek && (sectionSignups?.get(w) ?? 0) > 0,
            );

            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>
                    {section.course_name} {section.section_name}
                  </CardTitle>
                  <CardDescription>
                    {section.day} &middot;{" "}
                    {minutesToLabel(schedule.sectionStart)}–
                    {minutesToLabel(schedule.sectionEnd)} &middot;{" "}
                    {section.location}
                  </CardDescription>
                  <CardAction>
                    <div className="flex flex-col items-end gap-2">
                      <Label
                        className="cursor-pointer text-sm font-normal text-muted-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleShowPast(key);
                        }}
                      >
                        <Checkbox
                          checked={showingPast}
                          onCheckedChange={() => toggleShowPast(key)}
                        />
                        Show previous weeks
                      </Label>
                      <Button
                        size="sm"
                        disabled={!dirty.has(key) || saving.has(key)}
                        onClick={() => saveSection(key)}
                      >
                        {saving.has(key) ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : saved.has(key) && !dirty.has(key) ? (
                          <CheckCircle2 className="size-3.5 text-green-500" />
                        ) : null}
                        {saved.has(key) && !dirty.has(key)
                          ? "Saved"
                          : "Save Changes"}
                      </Button>
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {/* Master slider or locked message */}
                  {hasAnyFutureSignups ? (
                    <p className="mb-4 px-3 text-sm text-muted-foreground">
                      <Lock className="mr-1.5 inline size-3.5 -translate-y-px" />
                      Timeslot cannot be changed while a present or future week
                      has observation sign-ups.
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
                          min={schedule.sectionStart}
                          max={schedule.sectionEnd}
                          step={STEP}
                          value={schedule.timeRange}
                          onValueChange={(v) => setTimeRange(key, v)}
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
                      const isPast = week < currentWeek;
                      const signups = sectionSignups?.get(week) ?? 0;
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
                          <Label
                            className={`shrink-0 font-normal ${
                              isLocked ? "" : "cursor-pointer"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLocked) toggleWeek(key, week);
                            }}
                          >
                            <Checkbox
                              checked={slot.selected}
                              disabled={isLocked}
                              onCheckedChange={() => toggleWeek(key, week)}
                            />
                            <span className="w-16">Week {week}</span>
                          </Label>

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

                          {slot.selected && (
                            <div className="flex flex-1 items-center gap-3">
                              <Slider
                                min={schedule.sectionStart}
                                max={schedule.sectionEnd}
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
