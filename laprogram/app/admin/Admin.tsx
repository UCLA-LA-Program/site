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
  OBSERVATION_COUNT_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { fetcher } from "@/lib/utils";

type ConfigData = Record<string, string>;

export default function Admin() {
  const { data, mutate } = useSWR<ConfigData>("/api/config", fetcher);

  if (data === undefined) return <></>;

  async function setValue(key: string, value: string) {
    mutate({ ...data!, [key]: value }, { revalidate: false });
    try {
      const res = await fetch(`/api/admin/flag/${encodeURIComponent(key)}`, {
        method: "POST",
        body: value,
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to save");
    }
    mutate();
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
                value={data[QUARTER_START_KEY] ?? ""}
                onChange={(e) => setValue(QUARTER_START_KEY, e.target.value)}
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
                    checked={data[flag.key] === "true"}
                    onCheckedChange={() =>
                      setValue(
                        flag.key,
                        data[flag.key] === "true" ? "false" : "true",
                      )
                    }
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
              {LA_POSITION_OPTIONS.map((pos) => {
                const key = `${OBSERVATION_COUNT_PREFIX}${pos.value}`;
                return (
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
                      value={data[key] ?? "0"}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        if (!isNaN(num) && num >= 0) setValue(key, String(num));
                      }}
                    />
                  </div>
                );
              })}
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
