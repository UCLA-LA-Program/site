"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ObservationAuditRow } from "@/app/api/admin/audit/observations/route";

type ObserverEntry = {
  user_id: string;
  user_name: string;
  user_email: string;
  course_name: string;
  position: string;
  weeks: Record<string, number>;
  total: number;
};

export function ObservationAudit() {
  const { data } = useSWR<ObservationAuditRow[]>(
    "/api/admin/audit/observations",
    fetcher,
  );
  const [query, setQuery] = useState("");
  const [courseTypes, setCourseTypes] = useState<string[]>([]);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const map = new Map<string, ObserverEntry>();
  const weekSet = new Set<string>();

  for (const row of data) {
    const key = `${row.user_id}|${row.course_name}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        user_id: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        course_name: row.course_name,
        position: row.position,
        weeks: {},
        total: 0,
      };
      map.set(key, entry);
    }
    if (row.week) {
      entry.weeks[row.week] = (entry.weeks[row.week] ?? 0) + row.obs_count;
      entry.total += row.obs_count;
      weekSet.add(row.week);
    }
  }

  const courseTypeOptions = Array.from(
    new Set([...map.values()].map((e) => e.course_name.split(" ")[0])),
  ).sort();

  const q = query.trim().toLowerCase();
  const entries = [...map.values()]
    .filter((e) => {
      if (
        q &&
        !e.user_name.toLowerCase().includes(q) &&
        !e.user_email.toLowerCase().includes(q)
      )
        return false;
      if (
        courseTypes.length > 0 &&
        !courseTypes.includes(e.course_name.split(" ")[0])
      )
        return false;
      return true;
    })
    .sort((a, b) => a.user_name.localeCompare(b.user_name));
  const weeks = [...weekSet].sort((a, b) => Number(a) - Number(b));

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No LAs found.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        {query && (
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {entries.length} of {map.size}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {courseTypeOptions.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() =>
              setCourseTypes(
                courseTypes.includes(t)
                  ? courseTypes.filter((x) => x !== t)
                  : [...courseTypes, t],
              )
            }
            className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium ${
              courseTypes.includes(t)
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/70"
            }`}
          >
            {t}
            {courseTypes.includes(t) && (
              <X className="h-3 w-3 opacity-60" />
            )}
          </button>
        ))}
        {courseTypes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCourseTypes([])}
          >
            Clear
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-2 font-medium">LA</th>
            <th className="pb-2 pr-2 font-medium">Email</th>
            <th className="pb-2 pr-2 font-medium">Course</th>
            <th className="pb-2 pr-2 font-medium">Position</th>
            {weeks.map((w) => (
              <th key={w} className="pb-2 px-2 text-center font-medium">
                {w}
              </th>
            ))}
            <th className="pb-2 px-2 text-center font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.user_id}|${entry.course_name}`}
              className="border-b last:border-0"
            >
              <td className="py-1.5 pr-2 font-medium">{entry.user_name}</td>
              <td className="py-1.5 pr-2 text-muted-foreground">
                {entry.user_email}
              </td>
              <td className="py-1.5 pr-2 text-muted-foreground">
                {entry.course_name}
              </td>
              <td className="py-1.5 pr-2 text-muted-foreground">
                {entry.position}
              </td>
              {weeks.map((w) => (
                <td key={w} className="py-1.5 px-2 text-center">
                  {entry.weeks[w] ?? 0}
                </td>
              ))}
              <td className="py-1.5 px-2 text-center font-medium">
                {entry.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
