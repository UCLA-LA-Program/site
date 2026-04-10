"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { LA_POSITION_MAP } from "@/lib/constants";
import type { AvailabilityAuditRow } from "@/app/api/admin/audit/availability/route";

type SectionEntry = {
  la_id: string;
  la_name: string;
  course_name: string;
  section_name: string;
  section_id: string;
  position: string;
  weeks: Record<string, number>;
};

export function AvailabilityAudit() {
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
        course_name: row.course_name,
        section_name: row.section_name,
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

  const entries = [...map.values()];
  const weeks = [...weekSet].sort((a, b) => Number(a) - Number(b));

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No section assignments found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">LA</th>
            <th className="pb-2 pr-4 font-medium">Course</th>
            <th className="pb-2 pr-4 font-medium">Section</th>
            <th className="pb-2 pr-4 font-medium">Position</th>
            {weeks.map((w) => (
              <th key={w} className="pb-2 px-2 text-center font-medium">
                W{w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.la_id}|${entry.section_id}`}
              className="border-b last:border-0"
            >
              <td className="py-1.5 pr-4 font-medium">{entry.la_name}</td>
              <td className="py-1.5 pr-4 text-muted-foreground">
                {entry.course_name}
              </td>
              <td className="py-1.5 pr-4 text-muted-foreground">
                {entry.section_name}
              </td>
              <td className="py-1.5 pr-4 text-muted-foreground">
                {LA_POSITION_MAP.get(entry.position) ?? entry.position}
              </td>
              {weeks.map((w) => {
                const count = entry.weeks[w] ?? 0;
                return (
                  <td key={w} className="py-1.5 px-2 text-center">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
