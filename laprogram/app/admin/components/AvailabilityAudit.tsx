"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import type { AvailabilityAuditRow } from "@/app/api/admin/audit/availability/route";

type SectionEntry = {
  la_id: string;
  la_name: string;
  la_email: string;
  course_name: string;
  section_name: string;
  section_time: string;
  section_id: string;
  position: string;
  weeks: Record<string, number>;
};

export function AvailabilityAudit() {
  const [maxWeeks, setMaxWeeks] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { data } = useSWR<AvailabilityAuditRow[]>(
    "/api/admin/audit/availability",
    fetcher,
  );

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  // Build section entries grouped by la_id + section_id
  const map = new Map<string, SectionEntry>();
  const weekSet = new Set<string>();

  for (const row of data) {
    const key = `${row.la_id}|${row.section_id}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        la_id: row.la_id,
        la_name: row.la_name,
        la_email: row.la_email,
        course_name: row.course_name,
        section_name: row.section_name,
        section_time: row.section_time,
        section_id: row.section_id,
        position: row.position,
        weeks: {},
      };
      map.set(key, entry);
    }
    if (row.week) {
      entry.weeks[row.week] = row.slot_count;
      weekSet.add(row.week);
    }
  }

  const allEntries = [...map.values()];
  const weeks = [...weekSet].sort((a, b) => Number(a) - Number(b));

  const entries = maxWeeks
    ? allEntries.filter((e) => {
        const unavailable = weeks.filter((w) => !e.weeks[w]).length;
        return unavailable >= parseInt(maxWeeks, 10);
      })
    : allEntries;

  if (allEntries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No section assignments found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label htmlFor="max-weeks" className="text-sm text-muted-foreground">
          Show LAs with at least
        </label>
        <input
          id="max-weeks"
          type="number"
          min={0}
          max={weeks.length}
          value={maxWeeks}
          onChange={(e) => setMaxWeeks(e.target.value)}
          placeholder="0"
          className="w-16 rounded-md border px-2 py-1 text-sm"
        />
        <span className="text-sm text-muted-foreground">weeks unavailable</span>
        <button
          type="button"
          className="ml-auto rounded-md border px-3 py-1 text-sm hover:bg-muted"
          onClick={() => {
            const emails = [...new Set(entries.map((e) => e.la_email))].join(
              ", ",
            );
            navigator.clipboard.writeText(emails).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied
            ? "Copied!"
            : `Copy emails (${new Set(entries.map((e) => e.la_email)).size})`}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-2 font-medium">LA</th>
              <th className="pb-2 pr-2 font-medium">Email</th>
              <th className="pb-2 pr-2 font-medium">Section</th>
              <th className="pb-2 pr-2 font-medium">Position</th>
              <th className="pb-2 px-1 text-center font-medium">Unavail.</th>
              {weeks.map((w) => (
                <th key={w} className="pb-2 px-1 text-center font-medium">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const unavailable = weeks.filter((w) => !entry.weeks[w]).length;
              return (
                <tr
                  key={`${entry.la_id}|${entry.section_id}`}
                  className="border-b last:border-0"
                >
                  <td className="py-1.5 pr-2 font-medium">{entry.la_name}</td>
                  <td className="py-1.5 pr-2 text-muted-foreground">
                    {entry.la_email}
                  </td>
                  <td className="py-1.5 pr-2 text-muted-foreground">
                    {entry.course_name} {entry.section_name} (
                    {entry.section_time})
                  </td>
                  <td className="py-1.5 pr-2 text-muted-foreground">
                    {entry.position}
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    {unavailable > 0 ? (
                      <span className="inline-block min-w-5 rounded-full bg-red-500/20 px-1 text-xs leading-5 text-red-700 dark:text-red-400">
                        {unavailable}
                      </span>
                    ) : (
                      <span className="inline-block min-w-5 rounded-full bg-green-500/20 px-1 text-xs leading-5 text-green-700 dark:text-green-400">
                        0
                      </span>
                    )}
                  </td>
                  {weeks.map((w) => {
                    const count = entry.weeks[w] ?? 0;
                    return (
                      <td key={w} className="py-1.5 px-1 text-center">
                        {count > 0 ? (
                          <span className="inline-block size-5 rounded-full bg-green-500/20 text-xs leading-5 text-green-700 dark:text-green-400">
                            {count}
                          </span>
                        ) : (
                          <span className="inline-block size-5 rounded-full bg-red-500/20 text-xs leading-5 text-red-700 dark:text-red-400">
                            0
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
