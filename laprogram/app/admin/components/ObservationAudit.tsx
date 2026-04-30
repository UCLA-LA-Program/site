"use client";

import { Fragment, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Check, ChevronRight, Clock, Trash2, X } from "lucide-react";
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
import type { UnpairedFeedback } from "@/app/api/admin/audit/unpaired-feedbacks/route";

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
type SortKey = "name" | "email" | "completed" | "signed_up";
type StatusFilter = "all" | "done" | "pending";

type GroupedPerson = {
  id: string;
  name: string;
  email: string;
  position: string | null;
  rows: SignupRow[];
};

export function ObservationAudit() {
  const { data, mutate } = useSWR<SignupRow[]>(
    "/api/admin/audit/signups",
    fetcher,
  );
  const { data: roster } = useSWR<RosterUser[]>("/api/admin/roster", fetcher);
  const { data: unpaired, mutate: mutateUnpaired } = useSWR<UnpairedFeedback[]>(
    "/api/admin/audit/unpaired-feedbacks",
    fetcher,
  );
  const [groupBy, setGroupBy] = useState<GroupBy>("observer");
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [courseTypes, setCourseTypes] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("signed_up");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<SignupRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toPair, setToPair] = useState<UnpairedFeedback | null>(null);
  const [pairQuery, setPairQuery] = useState("");
  const [pairing, setPairing] = useState(false);

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

  function filterRowsFor(rows: SignupRow[]) {
    return rows.filter((r) => {
      if (
        courseTypes.length > 0 &&
        !courseTypes.includes(r.course_name.split(" ")[0])
      )
        return false;
      if (statusFilter === "done" && !r.completed) return false;
      if (statusFilter === "pending" && r.completed) return false;
      return true;
    });
  }

  const enriched = filtered.map((p) => {
    const filteredRows = filterRowsFor(p.rows);
    const completedCount = filteredRows.filter((r) => r.completed).length;
    return {
      ...p,
      filteredRows,
      completedCount,
      pendingCount: filteredRows.length,
    };
  });

  const sorted = [...enriched].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    if (sortKey === "email") return a.email.localeCompare(b.email) * dir;
    if (sortKey === "completed") {
      return (
        (a.completedCount - b.completedCount) * dir ||
        a.name.localeCompare(b.name)
      );
    }
    return (
      (a.pendingCount - b.pendingCount) * dir || a.name.localeCompare(b.name)
    );
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "completed" || key === "signed_up" ? "desc" : "asc");
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

  function expandAll() {
    setExpanded(new Set(sorted.map((p) => p.id)));
  }

  function collapseAll() {
    setExpanded(new Set());
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

  async function pairWithSignup(signup: SignupRow) {
    if (!toPair) return;
    setPairing(true);
    try {
      const res = await fetch(`/api/admin/feedback/${toPair.id}/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signup.observer_name,
          email: signup.observer_email,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        toast.error(`Pair failed: ${text}`);
        return;
      }
      toast.success(
        `Paired feedback to ${signup.observer_name} → ${signup.observee_name}`,
      );
      setToPair(null);
      setPairQuery("");
      await Promise.all([mutate(), mutateUnpaired()]);
    } catch {
      toast.error("Pair failed.");
    } finally {
      setPairing(false);
    }
  }

  const otherLabel = groupBy === "observer" ? "Observee" : "Observer";

  return (
    <div className="w-full max-w-6xl space-y-3">
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
        Status and done counts are inferred by matching feedback submissions to
        sign-ups and may not be fully accurate. Expect these numbers to shift
        after the observation-flow refactor between round 1 and round 2.
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
        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="done">Done</ToggleGroupItem>
          <ToggleGroupItem value="pending">Pending</ToggleGroupItem>
        </ToggleGroup>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand all
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
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
                onClick={() => toggleSort("completed")}
              >
                Completed{sortArrow("completed")}
              </th>
              <th
                className="cursor-pointer pb-2 pr-2 text-center font-medium select-none hover:text-foreground"
                onClick={() => toggleSort("signed_up")}
              >
                Signed up{sortArrow("signed_up")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const isOpen = expanded.has(p.id);
              const rows = p.filteredRows;
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
                    <td className="py-1.5 pr-2 text-center whitespace-nowrap">
                      <span
                        className={
                          p.completedCount > 0
                            ? "text-green-700 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {p.completedCount}
                      </span>
                    </td>
                    <td className="py-1.5 pr-2 text-center whitespace-nowrap">
                      <span
                        className={
                          p.pendingCount > 0 ? "" : "text-muted-foreground"
                        }
                      >
                        {p.pendingCount}
                      </span>
                    </td>
                  </tr>
                  {isOpen && canExpand && (
                    <tr className="border-b last:border-0 bg-muted/20">
                      <td />
                      <td colSpan={5} className="py-2 pr-2">
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
                              <th className="pb-1 pr-2 text-left font-medium">
                                Status
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
                                  <td className="py-1 pr-2 whitespace-nowrap">
                                    {r.completed ? (
                                      <span className="inline-flex items-center gap-1 rounded-sm bg-green-500/15 px-1.5 py-0.5 text-green-700 dark:text-green-400">
                                        <Check className="size-3" />
                                        Done
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground">
                                        <Clock className="size-3" />
                                        Pending
                                      </span>
                                    )}
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

      <div className="mt-6 space-y-2">
        <div>
          <h3 className="text-sm font-semibold">Unpaired feedbacks</h3>
          <p className="text-xs text-muted-foreground">
            Observation feedbacks whose observer email / obs_section does not
            match any sign-up. Pair one to a sign-up to overwrite the
            feedback&apos;s stored name and email so it matches.
          </p>
          <div className="my-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
            This is a dangerous feature. Do not use this unless you are
            completely sure of how it works. If this feature has not been
            explicitly explained to you, do not use it.
          </div>
        </div>
        {!unpaired ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : unpaired.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All observation feedbacks are paired.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-2 py-1.5 font-medium">
                    Submitted by (as typed)
                  </th>
                  <th className="px-2 py-1.5 font-medium">Observee</th>
                  <th className="px-2 py-1.5 font-medium">Course / Section</th>
                  <th className="px-2 py-1.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaired.map((f) => (
                  <tr key={f.id} className="border-b last:border-0">
                    <td className="px-2 py-1.5">
                      <div className="font-medium">
                        {f.observer_name || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {f.observer_email || "—"}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="font-medium">{f.observee_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {f.observee_email}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">
                      <div>{f.course || "—"}</div>
                      <div className="text-xs">{f.obs_section || "—"}</div>
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setToPair(f);
                          setPairQuery("");
                        }}
                      >
                        Pair with sign-up…
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={toPair !== null}
        onOpenChange={(open) => {
          if (!open) {
            setToPair(null);
            setPairQuery("");
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Pair feedback with sign-up</DialogTitle>
            <DialogDescription>
              {toPair && (
                <>
                  Select a sign-up. The feedback&apos;s stored name and email
                  will be overwritten to match the sign-up&apos;s observer, so
                  it can be linked on the audit table.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {toPair && (
            <div className="space-y-3">
              <div className="rounded-md border bg-muted/30 p-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Submitted by: </span>
                  <span className="font-medium">
                    {toPair.observer_name || "—"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    ({toPair.observer_email || "—"})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Observee: </span>
                  <span className="font-medium">{toPair.observee_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">obs_section: </span>
                  <span className="font-mono">{toPair.obs_section || "—"}</span>
                </div>
              </div>
              <Input
                placeholder="Search sign-ups by name, email, or course…"
                value={pairQuery}
                onChange={(e) => setPairQuery(e.target.value)}
              />
              <div className="max-h-80 overflow-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-2 py-1.5 font-medium">Observer</th>
                      <th className="px-2 py-1.5 font-medium">Observee</th>
                      <th className="px-2 py-1.5 font-medium">Section</th>
                      <th className="px-2 py-1.5 font-medium">When</th>
                      <th className="px-2 py-1.5 font-medium">Status</th>
                      <th className="px-2 py-1.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const pq = pairQuery.trim().toLowerCase();
                      const candidates = (data ?? [])
                        .filter((s) => {
                          if (s.observee_id !== toPair.observee_id)
                            return false;
                          if (!pq) return true;
                          return (
                            s.observer_name.toLowerCase().includes(pq) ||
                            s.observer_email.toLowerCase().includes(pq) ||
                            s.course_name.toLowerCase().includes(pq) ||
                            s.section_name.toLowerCase().includes(pq)
                          );
                        })
                        .sort(
                          (a, b) =>
                            Number(a.completed) - Number(b.completed) ||
                            a.observer_name.localeCompare(b.observer_name),
                        );
                      if (candidates.length === 0) {
                        return (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-2 py-3 text-center text-muted-foreground"
                            >
                              No sign-ups for this observee.
                            </td>
                          </tr>
                        );
                      }
                      return candidates.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-2 py-1.5">
                            <div className="font-medium">{s.observer_name}</div>
                            <div className="text-muted-foreground">
                              {s.observer_email}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">{s.observee_name}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            {s.course_name} {s.section_name}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            Wk {s.week} · {s.day} {formatTimeRange(s.time)}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            {s.completed ? (
                              <span className="inline-flex items-center gap-1 rounded-sm bg-green-500/15 px-1.5 py-0.5 text-green-700 dark:text-green-400">
                                <Check className="size-3" />
                                Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground">
                                <Clock className="size-3" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            <Button
                              size="sm"
                              disabled={pairing}
                              onClick={() => pairWithSignup(s)}
                            >
                              Pair
                            </Button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setToPair(null);
                setPairQuery("");
              }}
              disabled={pairing}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
