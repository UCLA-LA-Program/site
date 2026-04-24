"use client";

import { Fragment, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { ChevronRight, Trash2, X } from "lucide-react";
import { fetcher, parseSectionTime, minutesToLabel } from "@/lib/utils";
import { LA_POSITION_MAP } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SignupRow } from "@/app/api/admin/audit/signups/route";
import type { RosterUser } from "@/app/api/admin/roster/route";

function splitPositions(p: string | null): string[] {
  if (!p) return [];
  return p
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function positionLabel(p: string | null) {
  const parts = splitPositions(p);
  if (parts.length === 0) return "—";
  return parts.map((x) => LA_POSITION_MAP.get(x) ?? x).join(", ");
}

function formatTimeRange(time: string) {
  try {
    const [start, end] = parseSectionTime(time);
    const startLabel = minutesToLabel(start);
    const endLabel = minutesToLabel(end);
    const startPeriod = startLabel.slice(-2);
    const endPeriod = endLabel.slice(-2);
    if (startPeriod === endPeriod) {
      return `${startLabel.slice(0, -3)}-${endLabel}`;
    }
    return `${startLabel}-${endLabel}`;
  } catch {
    return time;
  }
}

type GroupBy = "observer" | "observee";
type SortKey = "name" | "email" | "count";

type GroupedPerson = {
  id: string;
  name: string;
  email: string;
  position: string | null;
  rows: SignupRow[];
};

export function SignupsList() {
  const { data, mutate } = useSWR<SignupRow[]>(
    "/api/admin/audit/signups",
    fetcher,
  );
  const { data: roster } = useSWR<RosterUser[]>(
    "/api/admin/roster",
    fetcher,
  );
  const [groupBy, setGroupBy] = useState<GroupBy>("observer");
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [courseTypes, setCourseTypes] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<SignupRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No observation sign-ups yet.
      </p>
    );
  }

  const positionOptions = Array.from(
    new Set(
      data.flatMap((r) => [
        ...splitPositions(r.observer_position),
        ...splitPositions(r.observee_position),
      ]),
    ),
  ).sort();

  const courseTypeOptions = Array.from(
    new Set(data.map((r) => r.course_name.split(" ")[0])),
  ).sort();

  // Build grouped persons. When grouping by observer, observers with no
  // sign-ups yet (but present on the roster) are still shown with count 0.
  const peopleMap = new Map<string, GroupedPerson>();
  if (roster) {
    for (const u of roster) {
      if (u.courses.length === 0) continue;
      const position =
        [...new Set(u.courses.map((c) => c.position))].join(",") || null;
      peopleMap.set(u.id, {
        id: u.id,
        name: u.name,
        email: u.email,
        position,
        rows: [],
      });
    }
  }
  for (const r of data) {
    const id = groupBy === "observer" ? r.observer_id : r.observee_id;
    const name = groupBy === "observer" ? r.observer_name : r.observee_name;
    const email = groupBy === "observer" ? r.observer_email : r.observee_email;
    const position =
      groupBy === "observer" ? r.observer_position : r.observee_position;
    let person = peopleMap.get(id);
    if (!person) {
      person = { id, name, email, position, rows: [] };
      peopleMap.set(id, person);
    }
    person.rows.push(r);
  }

  const q = query.trim().toLowerCase();
  const filtered = [...peopleMap.values()].filter((p) => {
    if (
      q &&
      !p.name.toLowerCase().includes(q) &&
      !p.email.toLowerCase().includes(q)
    )
      return false;
    if (positionFilter.length > 0) {
      const ps = splitPositions(p.position);
      if (!ps.some((x) => positionFilter.includes(x))) return false;
    }
    if (courseTypes.length > 0) {
      // Keep people whose sign-ups touch one of the selected course types.
      // For observers with no sign-ups, hide them when a course filter is on.
      const types = new Set(p.rows.map((r) => r.course_name.split(" ")[0]));
      if (![...types].some((t) => courseTypes.includes(t))) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    if (sortKey === "email") return a.email.localeCompare(b.email) * dir;
    return (
      (a.rows.length - b.rows.length) * dir || a.name.localeCompare(b.name)
    );
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "count" ? "desc" : "asc");
    }
  }

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/signup/${toDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        toast.error(`Delete failed: ${text}`);
        return;
      }
      toast.success(
        `Deleted: ${toDelete.observer_name} → ${toDelete.observee_name}`,
      );
      setToDelete(null);
      await mutate();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  const otherLabel = groupBy === "observer" ? "Observee" : "Observer";
  const countLabel = groupBy === "observer" ? "Observing" : "Observed by";

  return (
    <div className="w-full space-y-3 px-2">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          value={groupBy}
          onValueChange={(v) => {
            if (v) {
              setGroupBy(v as GroupBy);
              setExpanded(new Set());
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="observer">Group by observer</ToggleGroupItem>
          <ToggleGroupItem value="observee">Group by observee</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        {query && (
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {sorted.length} of {peopleMap.size}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Combobox
          items={positionOptions}
          multiple
          value={positionFilter}
          onValueChange={(v: string[]) => setPositionFilter(v)}
          filter={(item: string, query: string) => {
            const label = LA_POSITION_MAP.get(item) ?? item;
            return (
              item.toLowerCase().includes(query.toLowerCase()) ||
              label.toLowerCase().includes(query.toLowerCase())
            );
          }}
        >
          <ComboboxInput placeholder="Filter roles…" className="w-48" />
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
        {positionFilter.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPositionFilter([])}
          >
            Clear
          </Button>
        )}
      </div>
      {positionFilter.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {positionFilter.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                setPositionFilter(positionFilter.filter((x) => x !== p))
              }
              className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/70"
            >
              {LA_POSITION_MAP.get(p) ?? p}
              <X className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

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
            {courseTypes.includes(t) && <X className="h-3 w-3 opacity-60" />}
          </button>
        ))}
        {courseTypes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setCourseTypes([])}>
            Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="w-6 pb-2" />
              <th
                className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                onClick={() => toggleSort("name")}
              >
                {groupBy === "observer" ? "Observer" : "Observee"}
                {sortArrow("name")}
              </th>
              <th
                className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                onClick={() => toggleSort("email")}
              >
                Email{sortArrow("email")}
              </th>
              <th className="pb-2 pr-2 font-medium">Roles</th>
              <th
                className="cursor-pointer pb-2 pr-2 text-center font-medium select-none hover:text-foreground"
                onClick={() => toggleSort("count")}
              >
                {countLabel}
                {sortArrow("count")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const isOpen = expanded.has(p.id);
              const rows = courseTypes.length
                ? p.rows.filter((r) =>
                    courseTypes.includes(r.course_name.split(" ")[0]),
                  )
                : p.rows;
              const canExpand = rows.length > 0;
              return (
                <Fragment key={p.id}>
                  <tr
                    className={`border-b last:border-0 ${
                      canExpand ? "cursor-pointer hover:bg-muted/50" : ""
                    }`}
                    onClick={() => canExpand && toggleExpand(p.id)}
                  >
                    <td className="py-1.5 pl-1 pr-1">
                      {canExpand && (
                        <ChevronRight
                          className={`size-4 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </td>
                    <td className="py-1.5 pr-2 font-medium">{p.name}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {p.email}
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {positionLabel(p.position)}
                    </td>
                    <td className="py-1.5 pr-2 text-center">{rows.length}</td>
                  </tr>
                  {isOpen && canExpand && (
                    <tr className="border-b last:border-0 bg-muted/20">
                      <td />
                      <td colSpan={4} className="py-2 pr-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="pb-1 pr-2 text-left font-medium">
                                {otherLabel}
                              </th>
                              <th className="pb-1 pr-2 text-left font-medium">
                                Role
                              </th>
                              <th className="pb-1 pr-2 text-left font-medium">
                                Course / Section
                              </th>
                              <th className="pb-1 pr-2 text-left font-medium">
                                When
                              </th>
                              <th className="pb-1 pr-2 text-right font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r) => {
                              const otherName =
                                groupBy === "observer"
                                  ? r.observee_name
                                  : r.observer_name;
                              const otherEmail =
                                groupBy === "observer"
                                  ? r.observee_email
                                  : r.observer_email;
                              const otherPosition =
                                groupBy === "observer"
                                  ? r.observee_position
                                  : r.observer_position;
                              return (
                                <tr
                                  key={r.id}
                                  className="border-t border-border/50"
                                >
                                  <td className="py-1 pr-2">
                                    <div className="font-medium">
                                      {otherName}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {otherEmail}
                                    </div>
                                  </td>
                                  <td className="py-1 pr-2 text-muted-foreground">
                                    {positionLabel(otherPosition)}
                                  </td>
                                  <td className="py-1 pr-2 whitespace-nowrap text-muted-foreground">
                                    {r.course_name} {r.section_name}
                                  </td>
                                  <td className="py-1 pr-2 whitespace-nowrap text-muted-foreground">
                                    Wk {r.week} · {r.day}{" "}
                                    {formatTimeRange(r.time)}
                                  </td>
                                  <td className="py-1 pr-2 text-right">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setToDelete(r);
                                      }}
                                      aria-label="Delete sign-up"
                                    >
                                      <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete observation sign-up?</DialogTitle>
            <DialogDescription>
              {toDelete && (
                <>
                  Remove{" "}
                  <span className="font-medium text-foreground">
                    {toDelete.observer_name}
                  </span>
                  &apos;s sign-up to observe{" "}
                  <span className="font-medium text-foreground">
                    {toDelete.observee_name}
                  </span>{" "}
                  in {toDelete.course_name} {toDelete.section_name} (Wk{" "}
                  {toDelete.week}, {toDelete.day}{" "}
                  {formatTimeRange(toDelete.time)})? The availability slot will
                  be reopened.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete sign-up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
