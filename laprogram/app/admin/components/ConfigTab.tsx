"use client";

import { useState, useEffect } from "react";
import useSWRImmutable from "swr/immutable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { fetcher } from "@/lib/utils";
import {
  FEATURE_FLAGS,
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";

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
          <CardTitle>Observation Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 justify-between mb-2">
            <span className="text-sm font-medium shrink-0">Active round</span>
            <RadioGroup
              value={data[OBSERVATION_ACTIVE_ROUND_KEY] ?? "0"}
              onValueChange={(v) => setValue(OBSERVATION_ACTIVE_ROUND_KEY, v)}
              className="flex justify-end gap-4"
            >
              {[
                { value: "0", label: "Disabled" },
                { value: "1", label: "Round 1" },
                { value: "2", label: "Round 2" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-1.5 text-sm"
                >
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
          </div>
          {[1, 2].map((round) => {
            const key = `${OBSERVATION_ROUND_WEEKS_PREFIX}${round}`;
            return (
              <div key={round} className="flex items-center gap-2">
                <label
                  htmlFor={`round-weeks-${round}`}
                  className="flex-1 text-sm font-medium"
                >
                  Round {round} weeks
                  <span className="ml-2 text-xs text-muted-foreground">
                    e.g. 3,4,5
                  </span>
                </label>
                <Input
                  id={`round-weeks-${round}`}
                  className="w-32"
                  placeholder="3,4"
                  value={data[key] ?? ""}
                  onChange={(e) => setValue(key, e.target.value)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={!dirty || saving} onClick={save}>
          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
