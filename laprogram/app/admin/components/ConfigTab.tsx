"use client";

import { useState, useEffect } from "react";
import useSWRImmutable from "swr/immutable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Volume2 } from "lucide-react";
import { fetcher } from "@/lib/utils";
import {
  FEATURE_FLAGS,
  OBSERVATION_ENABLED_WEEKS_KEY,
  OBSERVATION_WEEK_ALLOWLIST_PREFIX,
  OBSERVATION_WEEK_RANGE,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { parseWeekList } from "@/lib/observation-weeks";

type ConfigData = Record<string, string>;

export function ConfigTab() {
  const { data: fetched, mutate } = useSWRImmutable<ConfigData>(
    "/api/admin/flag",
    fetcher,
  );
  const [data, setData] = useState<ConfigData>({});
  const [saved, setSaved] = useState<ConfigData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fetched) {
      setData(fetched);
      setSaved(fetched);
    }
  }, [fetched]);

  if (!fetched) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const dirty = Object.keys(data).some((k) => data[k] !== saved[k]);

  function setValue(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    const changed = Object.fromEntries(
      Object.keys(data)
        .filter((k) => data[k] !== saved[k])
        .map((k) => [k, data[k]]),
    );
    if (Object.keys(changed).length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changed),
      });
      if (!res.ok) throw new Error();
      const updated = { ...data };
      setSaved(updated);
      await mutate(updated, { revalidate: false });
      toast.success("Configuration saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl self-center">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Quarter Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <label
              htmlFor="quarter-start"
              className="flex-1 text-sm font-medium"
            >
              First Monday of the quarter
              <span className="ml-2 text-xs text-muted-foreground">
                (Used to calculate calendar dates from week numbers)
              </span>
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

      <Card size="sm">
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {FEATURE_FLAGS.map((flag) => (
              <label
                key={flag.key}
                className="flex cursor-pointer items-center gap-2 rounded-md py-0.5 text-sm hover:bg-muted/30"
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
                  <span className="ml-2 text-xs text-muted-foreground">
                    {flag.key}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Observation Weeks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const enabledSet = new Set(
              parseWeekList(data[OBSERVATION_ENABLED_WEEKS_KEY]),
            );
            return (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="text-sm font-medium">Enabled weeks</span>
                {OBSERVATION_WEEK_RANGE.map((w) => {
                  const week = String(w);
                  const checked = enabledSet.has(week);
                  return (
                    <label
                      key={week}
                      className="flex cursor-pointer items-center gap-1.5 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          const next = new Set(enabledSet);
                          if (checked) next.delete(week);
                          else next.add(week);
                          setValue(
                            OBSERVATION_ENABLED_WEEKS_KEY,
                            [...next]
                              .sort((a, b) => parseInt(a) - parseInt(b))
                              .join(","),
                          );
                        }}
                      />
                      {week}
                    </label>
                  );
                })}
              </div>
            );
          })()}
          {parseWeekList(data[OBSERVATION_ENABLED_WEEKS_KEY]).map((week) => {
            const allowlistKey = `${OBSERVATION_WEEK_ALLOWLIST_PREFIX}${week}`;
            return (
              <div key={week} className="space-y-1 rounded-md border p-3">
                <label
                  htmlFor={`week-allowlist-${week}`}
                  className="text-sm font-medium"
                >
                  Week {week} allowlist
                  <span className="ml-2 text-xs text-muted-foreground">
                    one email per line; leave empty for everyone
                  </span>
                </label>
                <Textarea
                  id={`week-allowlist-${week}`}
                  rows={3}
                  placeholder={`alice@g.ucla.edu\nbob@g.ucla.edu`}
                  value={data[allowlistKey] ?? ""}
                  onChange={(e) => setValue(allowlistKey, e.target.value)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const animals = [
              { name: "Cat", emoji: "🐱", file: "cat" },
              { name: "Cow", emoji: "🐮", file: "cow" },
              { name: "Dog", emoji: "🐶", file: "dog" },
              { name: "Duck", emoji: "🦆", file: "duck" },
              { name: "Elephant", emoji: "🐘", file: "elephant" },
              { name: "Frog", emoji: "🐸", file: "frog" },
              { name: "Goose", emoji: "🪿", file: "goose" },
              { name: "Horse", emoji: "🐴", file: "horse" },
              { name: "Monkey", emoji: "🐒", file: "monkey" },
              { name: "Owl", emoji: "🦉", file: "owl" },
              { name: "Penguin", emoji: "🐧", file: "penguin" },
              { name: "Pig", emoji: "🐷", file: "pig" },
              { name: "Rooster", emoji: "🐓", file: "rooster" },
              { name: "Sheep", emoji: "🐑", file: "sheep" },
            ];
            const animal = animals[Math.floor(Math.random() * animals.length)];
            new Audio(`/sounds/${animal.file}.mp3`).play();
            toast(`${animal.emoji} ${animal.name}!`);
          }}
        >
          <Volume2 className="mr-1.5 h-3.5 w-3.5" />
          Animal Sound
        </Button>
        <Button disabled={!dirty || saving} onClick={save}>
          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
