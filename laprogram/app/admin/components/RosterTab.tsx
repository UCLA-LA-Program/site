"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { X } from "lucide-react";
import { LA_POSITION_MAP, IMAGE_SIZE } from "@/lib/constants";
import { fetcher } from "@/lib/utils";
import { formatName, getNamePart } from "@/lib/name";
import { useTableSort } from "@/hooks/use-table-sort";
import { Button } from "@/components/ui/button";
import type { RosterUser } from "@/app/api/admin/roster/route";
import Image from "next/image";
import { NameSortHeader } from "./NameSortHeader";
import { SearchBar } from "./SearchBar";
import { PositionFilter } from "./PositionFilter";
import { CourseTypeFilter } from "./CourseTypeFilter";

type RosterSortKey = "first_name" | "last_name" | "email" | "courses";

export function RosterTab() {
  const { data: roster } = useSWR<RosterUser[]>("/api/admin/roster", fetcher);
  const [rosterQuery, setRosterQuery] = useState("");
  const [rosterCourseTypes, setRosterCourseTypes] = useState<string[]>([]);
  const [rosterCourses, setRosterCourses] = useState<string[]>([]);
  const [rosterPositions, setRosterPositions] = useState<string[]>([]);
  const {
    sortKey,
    sortDir,
    toggle: toggleSort,
    arrow: sortArrow,
  } = useTableSort<RosterSortKey>("first_name");

  if (!roster) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const courseTypeOptions = Array.from(
    new Set(
      roster.flatMap((u) =>
        u.courses.map((c) => c.course_name.split(" ")[0]),
      ),
    ),
  ).sort();
  const courseOptions = Array.from(
    new Set(roster.flatMap((u) => u.courses.map((c) => c.course_name))),
  ).sort();
  const positionOptions = Array.from(
    new Set(roster.flatMap((u) => u.courses.map((c) => c.position))),
  ).sort();

  const filteredRoster = roster
    .filter((u) => {
      const q = rosterQuery.trim().toLowerCase();
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false;
      if (
        rosterCourseTypes.length > 0 &&
        !u.courses.some((c) =>
          rosterCourseTypes.includes(c.course_name.split(" ")[0]),
        )
      )
        return false;
      if (
        rosterCourses.length > 0 &&
        !u.courses.some((c) => rosterCourses.includes(c.course_name))
      )
        return false;
      if (
        rosterPositions.length > 0 &&
        !u.courses.some((c) => rosterPositions.includes(c.position))
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const get = (u: RosterUser) => {
        if (sortKey === "courses")
          return u.courses.map((c) => c.course_name).join(",");
        if (sortKey === "email") return u.email ?? "";
        return getNamePart(u.name, sortKey === "last_name" ? "last" : "first");
      };
      return get(a).localeCompare(get(b)) * dir;
    });

  return (
    <div className="space-y-3 max-w-3xl self-center">
      <div className="space-y-3">
        <SearchBar
          query={rosterQuery}
          setQuery={setRosterQuery}
          filtered={filteredRoster.length}
          total={roster.length}
        />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Combobox
              items={courseOptions}
              multiple
              value={rosterCourses}
              onValueChange={(v: string[]) => setRosterCourses(v)}
              filter={(item: string, query: string) =>
                item.toLowerCase().includes(query.toLowerCase())
              }
            >
              <ComboboxInput
                placeholder="Filter courses…"
                className="w-[28rem]"
              />
              <ComboboxContent>
                <ComboboxEmpty>No courses</ComboboxEmpty>
                <ComboboxList>
                  <ComboboxCollection>
                    {(item: string) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {rosterCourses.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRosterCourses([])}
              >
                Clear
              </Button>
            )}
          </div>
          {rosterCourses.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {rosterCourses.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setRosterCourses(rosterCourses.filter((x) => x !== c))
                  }
                  className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/70"
                >
                  {c}
                  <X className="h-3 w-3 opacity-60" />
                </button>
              ))}
            </div>
          )}
        </div>
        <PositionFilter
          options={positionOptions}
          value={rosterPositions}
          onChange={setRosterPositions}
          inputClassName="w-[28rem]"
        />
        <CourseTypeFilter
          options={courseTypeOptions}
          value={rosterCourseTypes}
          onChange={setRosterCourseTypes}
        />
      </div>
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-32" />
          <col className="w-72" />
          <col />
        </colgroup>
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Photo</th>
            <th className="pb-2 font-medium select-none">
              <NameSortHeader toggle={toggleSort} arrow={sortArrow} />
            </th>
            <th
              className="cursor-pointer pb-2 font-medium select-none hover:text-foreground"
              onClick={() => toggleSort("courses")}
            >
              Courses{sortArrow("courses")}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRoster.map((user) => (
            <tr key={user.id} className="border-b last:border-0">
              <td className="py-2">
                {user.image ? (
                  <Image
                    height={IMAGE_SIZE}
                    width={IMAGE_SIZE}
                    src={user.image}
                    alt={user.name}
                    className="h-28 w-28 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md bg-muted text-xl font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
              </td>
              <td className="py-2">
                <div className="font-medium">
                  {formatName(user.name, sortKey === "last_name")}
                </div>
                <div className="text-muted-foreground">{user.email}</div>
              </td>
              <td className="py-2 text-muted-foreground">
                {user.courses
                  .map(
                    (c) =>
                      `${c.course_name} (${LA_POSITION_MAP.get(c.position) ?? c.position})`,
                  )
                  .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
