"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus, CalendarClock, User, MapPin, Filter, Info, X } from "lucide-react";
import { toast } from "sonner";
import { fetcher, getObsDate, hydrateDates, nowLA } from "@/lib/utils";
import { differenceInCalendarDays, isSameDay } from "date-fns";
import { DAY_INDEX, LA_POSITION_MAP } from "@/lib/constants";
import type { ObservationAvailability, Position } from "@/types/db";
import type { MyObservation } from "./types";
import { formatDateLA, formatTimeLA } from "./types";
import { PendingChanges } from "./components/PendingChanges";
import {
  PastObservations,
  FutureObservationsCard,
} from "./components/ObservationCard";

import {
  OBSERVATION_CHANGE_DAYS_LIMIT,
  OBSERVATION_FUTURE_LIMIT,
} from "@/lib/constants";
import { TZDate } from "@date-fns/tz";

type DateTab = { week: string; date: TZDate; label: string };

function buildDateTabs(
  weeks: string[],
  quarterStart: TZDate | string,
): DateTab[] {
  const tabs: DateTab[] = [];
  for (const week of weeks.sort((a, b) => parseInt(a) - parseInt(b))) {
    for (const day of DAY_INDEX.slice(0, 5)) {
      const date = getObsDate(week, day, quarterStart);
      tabs.push({
        week,
        date,
        label: formatDateLA(date),
      });
    }
  }
  return tabs;
}

export function SignUp({
  activeRound,
  quarterStart,
  roundWeeks,
}: {
  activeRound: number;
  quarterStart: string;
  roundWeeks: string[];
}) {
  const { data: openData, mutate: mutateOpen } = useSWR<{
    slots: ObservationAvailability[];
    filters: string[];
    notes: string[];
  }>(
    "/api/observation/open",
    (url: string) =>
      fetcher(url).then(
        (data: {
          slots: ObservationAvailability[];
          filters: string[];
          notes: string[];
        }) => ({
          slots: hydrateDates(data.slots),
          filters: data.filters,
          notes: data.notes,
        }),
      ),
    {
      suspense: true,
      fallbackData: { slots: [], filters: [], notes: [] },
    },
  );
  const openSlots = openData?.slots;
  const activeFilters = openData?.filters ?? [];
  const activeNotes = openData?.notes ?? [];

  const dateTabs = buildDateTabs(roundWeeks, quarterStart);

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const selectedTab =
    activeTab ?? (dateTabs.length > 0 ? dateTabs[0].label : "");
  const { data: myObservations, mutate: mutateObservations } = useSWR(
    "/api/observation",
    (url: string) => fetcher(url).then(hydrateDates<MyObservation>),
    { suspense: true, fallbackData: [] },
  );
  const { data: myCourses } = useSWR<Position[]>(
    "/api/la/self",
    fetcher,
    { fallbackData: [] },
  );

  type CourseFilterMode = "all" | "observer" | "observee";
  const [courseFilterMode, setCourseFilterMode] =
    useState<CourseFilterMode>("all");
  const [observeeCourses, setObserveeCourses] = useState<string[]>([]);

  const myCourseNames = new Set(
    (myCourses ?? []).map((c) => c.course_name),
  );
  const slotCourseOptions = Array.from(
    new Set((openSlots ?? []).map((s) => s.course_name)),
  ).sort();

  function passesCourseFilter(courseName: string): boolean {
    if (courseFilterMode === "observer") {
      return myCourseNames.has(courseName);
    }
    if (courseFilterMode === "observee") {
      return (
        observeeCourses.length === 0 || observeeCourses.includes(courseName)
      );
    }
    return true;
  }

  // Count slots per tab from ISO dates (after course filter so the tab
  // counts match what the user will actually see).
  const slotCounts = new Map<string, number>();
  for (const slot of openSlots ?? []) {
    if (!passesCourseFilter(slot.course_name)) continue;
    const label = formatDateLA(slot.time_start);
    slotCounts.set(label, (slotCounts.get(label) ?? 0) + 1);
  }

  const [pendingAdds, setPendingAdds] = useState<Set<string>>(new Set());
  const [pendingRemoves, setPendingRemoves] = useState<Set<string>>(new Set());

  const hasPendingChanges = pendingAdds.size > 0 || pendingRemoves.size > 0;

  useEffect(() => {
    if (!hasPendingChanges) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasPendingChanges]);

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

  // Find selected date from tabs
  const selectedDate = dateTabs.find((t) => t.label === selectedTab)?.date;

  // Filter slots for the active tab, excluding pending adds, applying course filter
  const available = (openSlots ?? []).filter(
    (s) =>
      selectedDate &&
      isSameDay(s.time_start, selectedDate) &&
      !pendingAdds.has(s.id) &&
      passesCourseFilter(s.course_name),
  );
  const pendingAddSlots = (openSlots ?? []).filter((s) =>
    pendingAdds.has(s.id),
  );

  // Split observations into past / upcoming (3 days) / future
  const pastObs: MyObservation[] = [];
  const upcomingObs: MyObservation[] = [];
  const futureObs: MyObservation[] = [];

  for (const obs of myObservations ?? []) {
    if (obs.time_start < nowLA()) {
      pastObs.push(obs);
    } else if (
      differenceInCalendarDays(obs.time_start, nowLA()) <
      OBSERVATION_CHANGE_DAYS_LIMIT
    ) {
      upcomingObs.push(obs);
    } else {
      futureObs.push(obs);
    }
  }

  const activeFuture = futureObs.filter((o) => !pendingRemoves.has(o.id));
  const pendingRemoveSlots = futureObs.filter((o) => pendingRemoves.has(o.id));

  const upcomingCount =
    upcomingObs.length +
    futureObs.filter((o) => !pendingRemoves.has(o.id)).length +
    pendingAdds.size;
  const atLimit = upcomingCount >= OBSERVATION_FUTURE_LIMIT;

  if (!openData || !myObservations) {
    return <></>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10 animate-fade-up">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left: available slots */}
        <div className="min-w-0 flex-1">
          <h1 className="mb-2 text-2xl font-bold">
            Observation Sign-Ups{activeRound > 0 && ` — Round ${activeRound}`}
          </h1>
          <p className="mb-2 text-sm text-muted-foreground">
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
          {atLimit && (
            <div className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              You&apos;ve reached the limit of {OBSERVATION_FUTURE_LIMIT}{" "}
              upcoming observations. Complete or cancel one before signing up
              for another.
            </div>
          )}
          {(activeFilters.length > 0 || activeNotes.length > 0) && (
            <div className="mb-5 flex flex-col gap-3">
              {activeFilters.length > 0 && (
                <div className="flex-1 rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                    <Filter className="size-3.5" />
                    Active filters
                  </p>
                  <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                    {activeFilters.map((desc) => (
                      <li key={desc}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activeNotes.length > 0 && (
                <div className="flex-1 rounded-md border border-muted-foreground/20 bg-muted/50 px-4 py-3">
                  <p className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                    <Info className="size-3.5" />
                    Notes
                  </p>
                  <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                    {activeNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={courseFilterMode}
              onValueChange={(v) => {
                if (!v) return;
                setCourseFilterMode(v as CourseFilterMode);
                if (v !== "observee") setObserveeCourses([]);
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="all">All courses</ToggleGroupItem>
              <ToggleGroupItem
                value="observer"
                disabled={myCourseNames.size === 0}
              >
                By observer
              </ToggleGroupItem>
              <ToggleGroupItem value="observee">By observee</ToggleGroupItem>
            </ToggleGroup>
          </div>
          {courseFilterMode === "observee" &&
            slotCourseOptions.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                {slotCourseOptions.map((course) => {
                  const active = observeeCourses.includes(course);
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() =>
                        setObserveeCourses(
                          active
                            ? observeeCourses.filter((c) => c !== course)
                            : [...observeeCourses, course],
                        )
                      }
                      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/70"
                      }`}
                    >
                      {course}
                      {active && <X className="h-3 w-3 opacity-60" />}
                    </button>
                  );
                })}
                {observeeCourses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setObserveeCourses([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
          {dateTabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No observation dates are currently available.
            </p>
          ) : (
            <Tabs value={selectedTab} onValueChange={setActiveTab}>
              <div className="mb-4 space-y-2">
                {roundWeeks.map((week) => (
                  <TabsList key={week} className="w-full justify-start">
                    <span className="px-2 text-xs text-muted-foreground">
                      Wk {week}
                    </span>
                    {dateTabs
                      .filter((tab) => tab.week === week)
                      .map((tab) => (
                        <TabsTrigger key={tab.label} value={tab.label}>
                          {tab.label} ({slotCounts.get(tab.label) ?? 0})
                        </TabsTrigger>
                      ))}
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
                    .sort(
                      (a, b) => a.time_start.getTime() - b.time_start.getTime(),
                    )
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
                              {LA_POSITION_MAP.get(slot.la_position) ??
                                slot.la_position}
                            </span>
                            <span className="text-muted-foreground">
                              {slot.course_name} {slot.section_name}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarClock className="size-3" />
                              {formatTimeLA(slot.time_start)}–
                              {formatTimeLA(slot.time_end)}
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
                          disabled={atLimit}
                          title={
                            atLimit
                              ? `Limit of ${OBSERVATION_FUTURE_LIMIT} upcoming observations reached.`
                              : undefined
                          }
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

        {/* Sidebar (top on mobile, right on desktop) */}
        <div className="order-first w-full shrink-0 lg:order-last lg:w-[32rem] lg:sticky lg:top-[7.25rem] lg:self-start lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto">
          <div className="space-y-4">
            <PendingChanges
              addSlots={pendingAddSlots}
              removeSlots={pendingRemoveSlots}
              onUndoAdd={undoAdd}
              onUndoRemove={undoRemoval}
              onConfirm={confirmChanges}
            />
            <FutureObservationsCard
              futureObservations={activeFuture}
              upcomingObservations={upcomingObs}
              onRemove={markForRemoval}
            />

            <PastObservations observations={pastObs} />
          </div>
        </div>
      </div>
    </div>
  );
}
