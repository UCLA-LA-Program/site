"use client";

import { useState, useEffect } from "react";
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
import { fetcher } from "@/lib/utils";
import {
  clockToMinutes,
  dayName,
  defaultAvailabilityWindow,
  fromISO,
  minutesLabel,
  minutesToClock,
} from "@/lib/time";
import { AvailabilityRow, Section } from "@/types/db";
import { OBSERVATION_WEEK_RANGE } from "@/lib/constants";
import useSWRImmutable from "swr/immutable";

const WEEKS = OBSERVATION_WEEK_RANGE;
const STEP = 10; // minutes
const MIN_RANGE = 30; // minutes

type CourseSchedule = {
  sectionId: string;
  sectionStart: number;
  sectionEnd: number;
  weekSlots: Map<number, WeekSlot>;
  timeRange: [number, number];
};

type WeekSlot = {
  selected: boolean;
  timeRange: [number, number];
};

/** Minutes since midnight in LA for a stored instant. */
function slotMinutes(iso: string | null): number | null {
  if (!iso) return null;
  const d = fromISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function buildSectionSchedule(
  section: Section,
  availability: AvailabilityRow[],
  currentWeek: number,
): CourseSchedule | null {
  if (!section.start_time || !section.end_time) return null;

  const sectionStart = clockToMinutes(section.start_time);
  const sectionEnd = clockToMinutes(section.end_time);
  const sectionAvail = availability.filter(
    (a) => a.section_id === section.section_id,
  );

  const weekSlots = new Map<number, WeekSlot>();
  const fallback = defaultAvailabilityWindow(section.end_time);
  let defaultStart = clockToMinutes(fallback.start);
  let defaultEnd = clockToMinutes(fallback.end);

  const futureAvail = sectionAvail.find((a) => a.week >= currentWeek);
  const futureStart = slotMinutes(futureAvail?.start_at ?? null);
  const futureEnd = slotMinutes(futureAvail?.end_at ?? null);
  if (futureStart !== null && futureEnd !== null) {
    defaultStart = futureStart;
    defaultEnd = futureEnd;
  }

  for (const week of WEEKS) {
    const weekAvail = sectionAvail.find((a) => a.week === week);
    const start = slotMinutes(weekAvail?.start_at ?? null);
    const end = slotMinutes(weekAvail?.end_at ?? null);
    if (weekAvail && start !== null && end !== null) {
      weekSlots.set(week, { selected: true, timeRange: [start, end] });
    } else {
      weekSlots.set(week, {
        // A slot with no instants predates the timestamp migration; it still
        // counts as selected, it just falls back to the default window.
        selected: !!weekAvail,
        timeRange: [defaultStart, defaultEnd],
      });
    }
  }

  return {
    sectionId: section.section_id,
    sectionStart,
    sectionEnd,
    weekSlots,
    timeRange: [defaultStart, defaultEnd],
  };
}

function signupCountsFromAvailability(
  availability: AvailabilityRow[],
): Map<number, number> {
  const counts = new Map<number, number>();
  for (const a of availability) {
    if (a.status !== "taken") continue;
    counts.set(a.week, (counts.get(a.week) ?? 0) + 1);
  }
  return counts;
}

export function ScheduleCard({
  section,
  currentWeek,
  laId,
}: {
  section: Section;
  currentWeek: number;
  laId?: string;
}) {
  const availabilityUrl = `/api/availability?section_id=${section.section_id}${
    laId ? `&la_id=${laId}` : ""
  }`;
  const { data: availability, mutate: mutateAvailability } = useSWRImmutable<
    AvailabilityRow[]
  >(availabilityUrl, fetcher);

  const [schedule, setSchedule] = useState<CourseSchedule>();
  const [showPast, setShowPast] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Build schedules once availability loads
  if (availability && !schedule) {
    setSchedule(
      buildSectionSchedule(section, availability, currentWeek) ?? undefined,
    );
  }

  const signupCounts = availability
    ? signupCountsFromAvailability(availability)
    : new Map<number, number>();

  async function saveSection() {
    if (!schedule) return;

    setSaving(true);
    const weeks: { week: number; start_time: string; end_time: string }[] = [];
    for (const [week, slot] of schedule.weekSlots) {
      if (slot.selected) {
        weeks.push({
          week,
          start_time: minutesToClock(slot.timeRange[0]),
          end_time: minutesToClock(slot.timeRange[1]),
        });
      }
    }

    try {
      await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_id: section.section_id,
          weeks,
          ...(laId ? { la_id: laId } : {}),
        }),
      });
      const freshAvailability = await mutateAvailability();
      if (section && freshAvailability) {
        setSchedule(
          buildSectionSchedule(section, freshAvailability, currentWeek) ??
            undefined,
        );
      }
      setDirty(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } finally {
      setSaving(false);
    }
  }

  function toggleWeek(week: number) {
    setSchedule((s) => {
      if (!s) return s;

      const weekSlots = new Map(s.weekSlots);
      const slot = weekSlots.get(week)!;
      weekSlots.set(week, { ...slot, selected: !slot.selected });
      return { ...s, weekSlots };
    });
    setDirty(true);
  }

  function setTimeRange(value: number[]) {
    setSchedule((s) => {
      if (!s) return s;

      let [start, end] = value;
      if (end - start < MIN_RANGE) {
        if (end - MIN_RANGE >= s.sectionStart) {
          start = end - MIN_RANGE;
        } else {
          end = start + MIN_RANGE;
        }
      }

      const weekSlots = new Map(s.weekSlots);
      for (const week of WEEKS) {
        if (week >= currentWeek) {
          const slot = weekSlots.get(week)!;
          weekSlots.set(week, { ...slot, timeRange: [start, end] });
        }
      }

      return { ...s, timeRange: [start, end], weekSlots };
    });
    setDirty(true);
  }

  const visibleWeeks = WEEKS.filter((w) => showPast || w >= currentWeek);
  const hasAnyFutureSignups = WEEKS.some(
    (w) => w >= currentWeek && (signupCounts.get(w) ?? 0) > 0,
  );

  if (!section || !availability || !schedule) {
    return <></>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {section.course_name} {section.section_name}
        </CardTitle>
        <CardDescription>
          {dayName(section.day_of_week)} &middot;{" "}
          {minutesLabel(schedule.sectionStart)}–
          {minutesLabel(schedule.sectionEnd)} &middot; {section.location}
        </CardDescription>
        <CardAction>
          <div className="flex flex-col items-end gap-2">
            <Label
              className="cursor-pointer text-sm font-normal text-muted-foreground"
              onClick={(e) => {
                e.preventDefault();
                setShowPast((sp) => !sp);
              }}
            >
              <Checkbox
                checked={showPast}
                onCheckedChange={() => setShowPast((sp) => !sp)}
              />
              Show previous weeks
            </Label>
            <Button
              size="sm"
              disabled={!dirty || saving}
              onClick={() => saveSection()}
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : saved && !dirty ? (
                <CheckCircle2 className="size-3.5 text-green-500" />
              ) : null}
              {saved && !dirty ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {/* Master slider or locked message */}
        {hasAnyFutureSignups ? (
          <p className="mb-4 px-3 text-sm text-muted-foreground">
            <Lock className="mr-1.5 inline size-3.5 -translate-y-px" />
            Timeslot cannot be changed while a present or future week has
            observation sign-ups.
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
                onValueChange={(v) => setTimeRange(v)}
                minStepsBetweenThumbs={MIN_RANGE / STEP}
              />
              <span className="w-32 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {minutesLabel(schedule.timeRange[0])}-
                {minutesLabel(schedule.timeRange[1])}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {visibleWeeks.map((week) => {
            const slot = schedule.weekSlots.get(week)!;
            const isPast = week < currentWeek;
            const signups = signupCounts.get(week) ?? 0;
            const hasSignups = signups > 0;
            const isLocked = isPast || hasSignups;

            return (
              <div
                key={week}
                className={`flex items-center gap-3 rounded-md px-3 py-0.5 text-sm ${
                  isPast ? "opacity-40" : hasSignups ? "bg-muted/40" : ""
                }`}
              >
                <Label
                  className={`shrink-0 font-normal ${
                    isLocked ? "" : "cursor-pointer"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isLocked) toggleWeek(week);
                  }}
                >
                  <Checkbox
                    checked={slot.selected}
                    disabled={isLocked}
                    onCheckedChange={() => toggleWeek(week)}
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
                    <span className="w-32 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                      {minutesLabel(slot.timeRange[0])}-
                      {minutesLabel(slot.timeRange[1])}
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
}
