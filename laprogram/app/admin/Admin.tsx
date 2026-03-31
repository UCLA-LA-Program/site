"use client";

import useSWR from "swr";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LA_POSITION_OPTIONS } from "@/app/feedback/constants";
import {
  FEATURE_FLAGS,
  type FlagKey,
  OBSERVATION_COUNT_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { fetcher } from "@/lib/utils";

type ConfigData = {
  flags: Record<string, boolean>;
  observationCounts: Record<string, number>;
  quarterStart: string | null;
};

async function setConfigValue(key: string, value: boolean | number | string) {
  const res = await fetch("/api/admin/setflag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error("Failed to save");
}

export default function Admin() {
  const { data, mutate, isLoading } = useSWR<ConfigData>(
    "/api/config",
    fetcher,
  );

  const flags = data?.flags ?? {};
  const observationCounts = data?.observationCounts ?? {};
  const quarterStart = data?.quarterStart ?? "";

  async function toggleFlag(key: FlagKey) {
    const newValue = !flags[key];
    mutate(
      { ...data!, flags: { ...flags, [key]: newValue } },
      { revalidate: false },
    );
    try {
      await setConfigValue(key, newValue);
    } catch {
      toast.error("Failed to save flag");
      mutate();
    }
  }

  async function setCount(position: string, value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    mutate(
      {
        ...data!,
        observationCounts: { ...observationCounts, [position]: num },
      },
      { revalidate: false },
    );
    try {
      await setConfigValue(`${OBSERVATION_COUNT_PREFIX}${position}`, num);
    } catch {
      toast.error("Failed to save count");
      mutate();
    }
  }

  async function setQuarterStart(value: string) {
    mutate(
      { ...data!, quarterStart: value },
      { revalidate: false },
    );
    try {
      await setConfigValue(QUARTER_START_KEY, value);
    } catch {
      toast.error("Failed to save quarter start date");
      mutate();
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-8 py-4">
        <h1 className="mb-3 text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-4">
      <h1 className="mb-3 text-2xl font-bold">Admin Panel</h1>

      <div className="space-y-3">
        {/* Quarter start date */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Quarter Settings</CardTitle>
            <CardDescription>
              First Monday of the quarter. Used to calculate calendar dates from
              week numbers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 px-1 py-1">
              <label
                htmlFor="quarter-start"
                className="flex-1 text-sm font-medium"
              >
                Start of Quarter
              </label>
              <Input
                id="quarter-start"
                type="date"
                className="w-40"
                value={quarterStart}
                onChange={(e) => setQuarterStart(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature flags */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Enable or disable features across the site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="-space-y-0.5">
              {FEATURE_FLAGS.map((flag) => (
                <label
                  key={flag.key}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted/30"
                >
                  <Checkbox
                    checked={flags[flag.key] ?? false}
                    onCheckedChange={() => toggleFlag(flag.key)}
                  />
                  <div>
                    <span className="font-medium">{flag.label}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {flag.key}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Observation counts per position */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Observations Per Round</CardTitle>
            <CardDescription>
              Number of observations required per round by LA position.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="-space-y-0.5">
              {LA_POSITION_OPTIONS.map((pos) => (
                <div
                  key={pos.value}
                  className="flex items-center gap-2 rounded-md px-1 py-1"
                >
                  <label
                    htmlFor={`obs-${pos.value}`}
                    className="flex-1 text-sm font-medium"
                  >
                    {pos.label}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {pos.value}
                    </span>
                  </label>
                  <Input
                    id={`obs-${pos.value}`}
                    type="number"
                    min={0}
                    className="w-20"
                    value={observationCounts[pos.value] ?? 0}
                    onChange={(e) => setCount(pos.value, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Changes are saved automatically.
        </p>
      </div>
    </div>
  );
}
