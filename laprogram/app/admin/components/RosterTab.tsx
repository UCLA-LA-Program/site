"use client";

import { useState } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import type { RosterUser } from "@/app/api/admin/roster/route";
import Image from "next/image";

type RosterSortKey = "first_name" | "last_name" | "email" | "courses";

export function RosterTab() {
  const { data: roster } = useSWR<RosterUser[]>("/api/admin/roster", fetcher, {
    suspense: true,
    fallbackData: [],
  });
  const [rosterQuery, setRosterQuery] = useState("");
  const [rosterCourses, setRosterCourses] = useState<string[]>([]);
  const [rosterPositions, setRosterPositions] = useState<string[]>([]);
  const [rosterSortKey, setRosterSortKey] =
    useState<RosterSortKey>("first_name");
  const [rosterSortDir, setRosterSortDir] = useState<"asc" | "desc">("asc");

  if (!roster) {
    return <p className="text-sm text-muted-foreground">Loading roster…</p>;
  }

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
      const dir = rosterSortDir === "asc" ? 1 : -1;
      const get = (u: RosterUser) => {
        if (rosterSortKey === "courses")
          return u.courses.map((c) => c.course_name).join(",");
        if (rosterSortKey === "email") return u.email ?? "";
        const parts = u.name.trim().split(/\s+/);
        return rosterSortKey === "first_name"
          ? (parts[0] ?? "")
          : (parts[parts.length - 1] ?? "");
      };
      return get(a).localeCompare(get(b)) * dir;
    });

  function toggleRosterSort(key: RosterSortKey) {
    if (rosterSortKey === key) {
      setRosterSortDir(rosterSortDir === "asc" ? "desc" : "asc");
    } else {
      setRosterSortKey(key);
      setRosterSortDir("asc");
    }
  }

  const sortArrow = (key: RosterSortKey) =>
    rosterSortKey === key ? (rosterSortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="space-y-3 max-w-3xl self-center">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name or email…"
            value={rosterQuery}
            onChange={(e) => setRosterQuery(e.target.value)}
            className="max-w-xs"
          />
          {rosterQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRosterQuery("")}
            >
              Clear
            </Button>
          )}
          <span className="ml-auto self-center text-xs text-muted-foreground">
            {filteredRoster.length} of {roster.length}
          </span>
        </div>
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
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Combobox
              items={positionOptions}
              multiple
              value={rosterPositions}
              onValueChange={(v: string[]) => setRosterPositions(v)}
              filter={(item: string, query: string) => {
                const label = LA_POSITION_MAP.get(item) ?? item;
                return (
                  item.toLowerCase().includes(query.toLowerCase()) ||
                  label.toLowerCase().includes(query.toLowerCase())
                );
              }}
            >
              <ComboboxInput
                placeholder="Filter roles…"
                className="w-[28rem]"
              />
              <ComboboxContent>
                <ComboboxEmpty>No roles</ComboboxEmpty>
                <ComboboxList>
                  <ComboboxCollection>
                    {(item: string) => (
                      <ComboboxItem key={item} value={item}>
                        {LA_POSITION_MAP.get(item) ?? item}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {rosterPositions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRosterPositions([])}
              >
                Clear
              </Button>
            )}
          </div>
          {rosterPositions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {rosterPositions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setRosterPositions(rosterPositions.filter((x) => x !== p))
                  }
                  className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/70"
                >
                  {LA_POSITION_MAP.get(p) ?? p}
                  <X className="h-3 w-3 opacity-60" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Photo</th>
            <th className="pb-2 font-medium select-none">
              <span
                className="cursor-pointer hover:text-foreground"
                onClick={() => toggleRosterSort("first_name")}
              >
                First{sortArrow("first_name")}
              </span>
              <span className="mx-1 text-muted-foreground/50">/</span>
              <span
                className="cursor-pointer hover:text-foreground"
                onClick={() => toggleRosterSort("last_name")}
              >
                Last{sortArrow("last_name")}
              </span>
            </th>
            <th
              className="cursor-pointer pb-2 font-medium select-none hover:text-foreground"
              onClick={() => toggleRosterSort("email")}
            >
              Email{sortArrow("email")}
            </th>
            <th
              className="cursor-pointer pb-2 font-medium select-none hover:text-foreground"
              onClick={() => toggleRosterSort("courses")}
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
                    className="h-28 w-28 rounded-md object-cover mr-3"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-md bg-muted text-xl mr-3 font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
              </td>
              <td className="py-2 font-medium">
                {(() => {
                  const parts = user.name.trim().split(/\s+/);
                  if (parts.length < 2) return user.name;
                  const last = parts[parts.length - 1];
                  const first = parts.slice(0, -1).join(" ");
                  return `${last}, ${first}`;
                })()}
              </td>
              <td className="py-2 text-muted-foreground">{user.email}</td>
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
