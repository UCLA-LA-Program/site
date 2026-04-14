"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
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

  const entries = [...map.values()].sort((a, b) =>
    a.user_name.localeCompare(b.user_name),
  );
  const weeks = [...weekSet].sort((a, b) => Number(a) - Number(b));

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No LAs found.</p>;
  }

  return (
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
  );
}
