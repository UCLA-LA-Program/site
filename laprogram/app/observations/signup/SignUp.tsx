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
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { fetcher, getObsDate } from "@/lib/utils";
import { format, differenceInCalendarDays, isSameDay } from "date-fns";
import {
  QUARTER_START_KEY,
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
  DAY_INDEX,
} from "@/lib/constants";
import type { Availability } from "@/types/db";

const UPCOMING_DAYS = 3;

type MyObservation = {
  id: string;
  observee_name: string;
  observee_image: string | null;
  course_name: string;
  section_name: string;
  time_start: string;
  time_end: string;
  location: string;
  ta_name: string | null;
  ta_email: string | null;
};

function formatTime(iso: string): string {
  return format(new Date(iso), "h:mm a");
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
      tabs.push({ week, date, label: format(date, "M/d") });
    }
  }
  return tabs;
}

export default function SignUp() {
  const { data: config } = useSWR<Record<string, string>>(
    "/api/config",
    fetcher,
  );
  const activeRound = parseInt(
    config?.[OBSERVATION_ACTIVE_ROUND_KEY] ?? "0",
    10,
  );
  const quarterStart = config?.[QUARTER_START_KEY] ?? "";
  const roundWeeksRaw =
    config?.[`${OBSERVATION_ROUND_WEEKS_PREFIX}${activeRound}`] ?? "";
  const roundWeeks = roundWeeksRaw
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

  const { data: openSlots, mutate: mutateOpen } = useSWR<Availability[]>(
    "/api/observation/open",
    fetcher,
  );

  const dateTabs = buildDateTabs(roundWeeks, quarterStart);

  // Count slots per tab from ISO dates
  const slotCounts = new Map<string, number>();
  for (const slot of openSlots ?? []) {
    const label = format(new Date(slot.time_start), "M/d");
    slotCounts.set(label, (slotCounts.get(label) ?? 0) + 1);
  }

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const selectedTab =
    activeTab ?? (dateTabs.length > 0 ? dateTabs[0].label : "");
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

  // Find selected date from tabs
  const selectedDate = dateTabs.find((t) => t.label === selectedTab)?.date;

  // Filter slots for the active tab, excluding pending adds
  const available = (openSlots ?? []).filter(
    (s) =>
      selectedDate &&
      isSameDay(new Date(s.time_start), selectedDate) &&
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
    const days = differenceInCalendarDays(new Date(obs.time_start), new Date());
    if (days < 0) {
      pastObs.push(obs);
    } else if (days < UPCOMING_DAYS) {
      upcomingObs.push(obs);
    } else {
      futureObs.push(obs);
    }
  }

  const activeFuture = futureObs.filter((o) => !pendingRemoves.has(o.id));
  const pendingRemoveSlots = futureObs.filter((o) => pendingRemoves.has(o.id));

  if (!openSlots || !myObservations) {
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
              <span className="font-medium text-foreground">Upcoming</span> —
              observations within the next 3 days. These cannot be cancelled.
            </li>
            <li>
              <span className="font-medium text-foreground">Future</span> —
              observations more than 3 days away. You can cancel and reschedule
              these.
            </li>
            <li>
              <span className="font-medium text-foreground">Past</span> —
              completed observations for your records.
            </li>
          </ul>
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
                        <TabsTrigger
                          key={tab.label}
                          value={tab.label}
                        >
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
                    .sort((a, b) => a.time_start.localeCompare(b.time_start))
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
                              {formatTime(slot.time_start)}–{formatTime(slot.time_end)}
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
            {/* Future observations (deletable) */}
            <Card>
              <CardHeader>
                <CardTitle>Future Observations</CardTitle>
              </CardHeader>
              <CardContent>
                {activeFuture.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No future observations yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeFuture.map((obs) => (
                      <ObservationRow
                        key={obs.id}
                        obs={obs}
                       
                        onRemove={() => markForRemoval(obs.id)}
                      />
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
                                {format(new Date(slot.time_start), "M/d")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(slot.time_start)}–{formatTime(slot.time_end)} &middot;{" "}
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
                                {format(new Date(obs.time_start), "M/d")}
                              </p>
                              <p className="text-xs text-muted-foreground line-through opacity-60">
                                {formatTime(obs.time_start)}–{formatTime(obs.time_end)} &middot;{" "}
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

            {/* Upcoming observations (within 36h — locked) */}
            {upcomingObs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Upcoming Observations
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      next 3 days
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingObs.map((obs) => (
                      <ObservationRow key={obs.id} obs={obs} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Past observations (collapsible, info only) */}
            {pastObs.length > 0 && (
              <Card>
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-1.5">
                        <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
                        Past Observations
                        <span className="text-xs font-normal text-muted-foreground">
                          ({pastObs.length})
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </summary>
                  <CardContent>
                    <div className="space-y-4 opacity-60">
                      {pastObs.map((obs) => (
                        <ObservationRow
                          key={obs.id}
                          obs={obs}
                         
                        />
                      ))}
                    </div>
                  </CardContent>
                </details>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ObservationRow({
  obs,
  onRemove,
}: {
  obs: MyObservation;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
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
            {format(new Date(obs.time_start), "M/d")}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTime(obs.time_start)}–{formatTime(obs.time_end)} &middot; {obs.location}
          </p>
          {obs.ta_name && (
            <p className="text-xs text-muted-foreground">
              TA: {obs.ta_name}
              {obs.ta_email && <span> ({obs.ta_email})</span>}
            </p>
          )}
        </div>
      </div>
      {onRemove && (
        <Button size="icon-xs" variant="ghost" onClick={onRemove}>
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
