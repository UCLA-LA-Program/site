"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { LA_POSITION_MAP } from "@/lib/constants";
import type { ObservationAuditData } from "@/app/api/admin/audit/observations/route";
import type { RosterUser } from "@/app/api/admin/roster/route";

type ObserverEntry = {
  observer_id: string;
  observer_name: string;
  observer_email: string;
  course_name: string;
  position: string;
  weeks: Record<string, number>;
  total: number;
};

export function ObservationAudit() {
  const { data } = useSWR<ObservationAuditData>(
    "/api/admin/audit/observations",
    fetcher,
  );
  const { data: roster } = useSWR<RosterUser[]>("/api/admin/roster", fetcher);

  if (!data || !roster) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const { observations, courses } = data;

  // Build course/position per user from full course list
  const coursesByUser = new Map<string, { course_name: string; position: string }[]>();
  for (const c of courses) {
    const existing = coursesByUser.get(c.user_id) ?? [];
    existing.push({ course_name: c.course_name, position: c.position });
    coursesByUser.set(c.user_id, existing);
  }

  // Build observation counts per observer
  const obsMap = new Map<string, { weeks: Record<string, number>; total: number }>();
  const weekSet = new Set<string>();

  for (const row of observations) {
    let entry = obsMap.get(row.observer_id);
    if (!entry) {
      entry = { weeks: {}, total: 0 };
      obsMap.set(row.observer_id, entry);
    }
    if (row.week) {
      entry.weeks[row.week] = (entry.weeks[row.week] ?? 0) + row.obs_count;
      entry.total += row.obs_count;
      weekSet.add(row.week);
    }
  }

  const weeks = [...weekSet].sort((a, b) => Number(a) - Number(b));

  // Build entries for ALL LAs — one row per course assignment
  const entries: ObserverEntry[] = roster
    .filter((u) => u.courses.length > 0)
    .flatMap((u) => {
      const userCourses = coursesByUser.get(u.id) ?? [{ course_name: "", position: "" }];
      const obs = obsMap.get(u.id);
      return userCourses.map((c) => ({
        observer_id: u.id,
        observer_name: u.name,
        observer_email: u.email,
        course_name: c.course_name,
        position: c.position,
        weeks: obs?.weeks ?? {},
        total: obs?.total ?? 0,
      }));
    })
    .sort((a, b) => a.observer_name.localeCompare(b.observer_name));

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No LAs found.</p>
    );
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
                W{w}
              </th>
            ))}
            <th className="pb-2 px-2 text-center font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.observer_id}|${entry.course_name}`}
              className="border-b last:border-0"
            >
              <td className="py-1.5 pr-2 font-medium">
                {entry.observer_name}
              </td>
              <td className="py-1.5 pr-2 text-muted-foreground">
                {entry.observer_email}
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
