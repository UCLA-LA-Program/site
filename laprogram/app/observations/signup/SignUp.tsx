"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CalendarClock, User, MapPin, Filter } from "lucide-react";
import { toast } from "sonner";
import { fetcher, getObsDate } from "@/lib/utils";
import { format, differenceInCalendarDays, isSameDay } from "date-fns";
import { DAY_INDEX } from "@/lib/constants";
import type { Availability } from "@/types/db";
import { LA_POSITION_MAP } from "@/app/feedback/constants";
import type { MyObservation } from "./types";
import { formatTime } from "./types";
import { PendingChanges } from "./components/PendingChanges";
import {
  PastObservations,
  FutureObservationsCard,
} from "./components/ObservationCard";

import { OBSERVATION_CHANGE_DAYS_LIMIT } from "@/lib/constants";

function hydrateDates<T extends { time_start: Date; time_end: Date }>(
  items: T[],
): T[] {
  return items.map((item) => ({
    ...item,
    time_start: new Date(item.time_start),
    time_end: new Date(item.time_end),
  }));
}

type DateTab = { week: string; date: Date; label: string };

function buildDateTabs(
  weeks: string[],
  quarterStart: Date | string,
): DateTab[] {
  const tabs: DateTab[] = [];
  for (const week of weeks.sort((a, b) => parseInt(a) - parseInt(b))) {
    for (const day of DAY_INDEX.slice(0, 5)) {
      const date = getObsDate(week, day, quarterStart);
      if (date > new Date()) {
        tabs.push({ week, date, label: format(date, "M/d") });
      }
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
    slots: Availability[];
    filters: string[];
  }>("/api/observation/open", (url: string) =>
    fetcher(url).then((data: { slots: Availability[]; filters: string[] }) => ({
      slots: hydrateDates(data.slots),
      filters: data.filters,
    })),
  );
  const openSlots = openData?.slots;
  const activeFilters = openData?.filters ?? [];

  const dateTabs = buildDateTabs(roundWeeks, quarterStart);

  // Count slots per tab from ISO dates
  const slotCounts = new Map<string, number>();
  for (const slot of openSlots ?? []) {
    const label = format(slot.time_start, "M/d");
    slotCounts.set(label, (slotCounts.get(label) ?? 0) + 1);
  }

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const selectedTab =
    activeTab ?? (dateTabs.length > 0 ? dateTabs[0].label : "");
  const { data: myObservations, mutate: mutateObservations } = useSWR(
    "/api/observation",
    (url: string) => fetcher(url).then(hydrateDates<MyObservation>),
  );

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

  // Filter slots for the active tab, excluding pending adds
  const available = (openSlots ?? []).filter(
    (s) =>
      selectedDate &&
      isSameDay(s.time_start, selectedDate) &&
      !pendingAdds.has(s.id),
  );
  const pendingAddSlots = (openSlots ?? []).filter((s) =>
    pendingAdds.has(s.id),
  );

  // Split observations into past / upcoming (3 days) / future
  const pastObs: MyObservation[] = [];
  const upcomingObs: MyObservation[] = [];
  const futureObs: MyObservation[] = [];

  for (const obs of myObservations ?? []) {
    if (obs.time_start < new Date()) {
      pastObs.push(obs);
    } else if (
      differenceInCalendarDays(obs.time_start, new Date()) <
      OBSERVATION_CHANGE_DAYS_LIMIT
    ) {
      upcomingObs.push(obs);
    } else {
      futureObs.push(obs);
    }
  }

  const activeFuture = futureObs.filter((o) => !pendingRemoves.has(o.id));
  const pendingRemoveSlots = futureObs.filter((o) => pendingRemoves.has(o.id));

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
          <ul className="mb-5 list-disc space-y-1 pl-5 text-sm">
            <li>
              <span className="font-medium text-foreground">Future</span> —
              observations more than {OBSERVATION_CHANGE_DAYS_LIMIT} days away.
              You can cancel and reschedule these.
            </li>
            <li>
              <span className="font-medium text-foreground">Upcoming</span> —
              observations within the next {OBSERVATION_CHANGE_DAYS_LIMIT} days.
              These cannot be cancelled.
            </li>
            <li>
              <span className="font-medium text-foreground">Past</span> —
              completed observations for your records.
            </li>
          </ul>
          {activeFilters.length > 0 && (
            <div className="mb-5 rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
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
                              {formatTime(slot.time_start)}–
                              {formatTime(slot.time_end)}
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

        {/* Sidebar (top on mobile, right on desktop) */}
        <div className="order-first w-full shrink-0 lg:order-last lg:w-[32rem]">
          <div className="space-y-4 lg:sticky lg:top-24">
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
