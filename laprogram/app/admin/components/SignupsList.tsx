"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";
import { fetcher, parseSectionTime, minutesToLabel } from "@/lib/utils";
import { LA_POSITION_MAP } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

type SignupSortKey = "observer" | "observee" | "course" | "when";
type CountSortKey = "name" | "email" | "as_observer";

export function SignupsList() {
  const { data, mutate } = useSWR<SignupRow[]>(
    "/api/admin/audit/signups",
    fetcher,
  );
  const { data: roster } = useSWR<RosterUser[]>(
    "/api/admin/roster",
    fetcher,
  );
  const [query, setQuery] = useState("");
  const [observerPositions, setObserverPositions] = useState<string[]>([]);
  const [observeePositions, setObserveePositions] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SignupSortKey>("when");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [countSortKey, setCountSortKey] = useState<CountSortKey>("as_observer");
  const [countSortDir, setCountSortDir] = useState<"asc" | "desc">("desc");
  const [countQuery, setCountQuery] = useState("");
  const [countPositions, setCountPositions] = useState<string[]>([]);
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

  const q = query.trim().toLowerCase();
  const filtered = data
    .filter((r) => {
      if (
        q &&
        !r.observer_name.toLowerCase().includes(q) &&
        !r.observer_email.toLowerCase().includes(q) &&
        !r.observee_name.toLowerCase().includes(q) &&
        !r.observee_email.toLowerCase().includes(q) &&
        !r.course_name.toLowerCase().includes(q)
      )
        return false;
      if (observerPositions.length > 0) {
        const ps = splitPositions(r.observer_position);
        if (!ps.some((p) => observerPositions.includes(p))) return false;
      }
      if (observeePositions.length > 0) {
        const ps = splitPositions(r.observee_position);
        if (!ps.some((p) => observeePositions.includes(p))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "observer")
        return a.observer_name.localeCompare(b.observer_name) * dir;
      if (sortKey === "observee")
        return a.observee_name.localeCompare(b.observee_name) * dir;
      if (sortKey === "course") {
        const ca = `${a.course_name} ${a.section_name}`;
        const cb = `${b.course_name} ${b.section_name}`;
        return ca.localeCompare(cb) * dir;
      }
      const wa = Number(a.week);
      const wb = Number(b.week);
      if (wa !== wb) return (wa - wb) * dir;
      if (a.day !== b.day) return a.day.localeCompare(b.day) * dir;
      return a.time.localeCompare(b.time) * dir;
    });

  function toggleSort(key: SignupSortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortArrow = (key: SignupSortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  type CountRow = {
    id: string;
    name: string;
    email: string;
    position: string | null;
    as_observer: number;
  };
  const countMap = new Map<string, CountRow>();
  if (roster) {
    for (const u of roster) {
      if (u.courses.length === 0) continue;
      const position =
        [...new Set(u.courses.map((c) => c.position))].join(",") || null;
      countMap.set(u.id, {
        id: u.id,
        name: u.name,
        email: u.email,
        position,
        as_observer: 0,
      });
    }
  }
  for (const r of data) {
    let obs = countMap.get(r.observer_id);
    if (!obs) {
      obs = {
        id: r.observer_id,
        name: r.observer_name,
        email: r.observer_email,
        position: r.observer_position,
        as_observer: 0,
      };
      countMap.set(r.observer_id, obs);
    }
    obs.as_observer += 1;
  }
  const cq = countQuery.trim().toLowerCase();
  const counts = [...countMap.values()]
    .filter((c) => {
      if (
        cq &&
        !c.name.toLowerCase().includes(cq) &&
        !c.email.toLowerCase().includes(cq)
      )
        return false;
      if (countPositions.length > 0) {
        const ps = splitPositions(c.position);
        if (!ps.some((p) => countPositions.includes(p))) return false;
      }
      return true;
    })
    .sort((a, b) => {
    const dir = countSortDir === "asc" ? 1 : -1;
    if (countSortKey === "name") return a.name.localeCompare(b.name) * dir;
    if (countSortKey === "email") return a.email.localeCompare(b.email) * dir;
    return (a.as_observer - b.as_observer) * dir || a.name.localeCompare(b.name);
  });

  function toggleCountSort(key: CountSortKey) {
    if (countSortKey === key) {
      setCountSortDir(countSortDir === "asc" ? "desc" : "asc");
    } else {
      setCountSortKey(key);
      setCountSortDir(key === "name" || key === "email" ? "asc" : "desc");
    }
  }

  const countArrow = (key: CountSortKey) =>
    countSortKey === key ? (countSortDir === "asc" ? " ↑" : " ↓") : "";

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

  return (
    <div className="w-full px-2">
      <Tabs defaultValue="pairings" className="space-y-4">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="pairings">Pairings</TabsTrigger>
            <TabsTrigger value="counts">Counts</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pairings" className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search observer, observee, or course…"
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
              {filtered.length} of {data.length}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Combobox
                items={positionOptions}
                multiple
                value={observerPositions}
                onValueChange={(v: string[]) => setObserverPositions(v)}
                filter={(item: string, query: string) => {
                  const label = LA_POSITION_MAP.get(item) ?? item;
                  return (
                    item.toLowerCase().includes(query.toLowerCase()) ||
                    label.toLowerCase().includes(query.toLowerCase())
                  );
                }}
              >
                <ComboboxInput
                  placeholder="Filter observer roles…"
                  className="w-[22rem]"
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
              {observerPositions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setObserverPositions([])}
                >
                  Clear
                </Button>
              )}
            </div>
            {observerPositions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {observerPositions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setObserverPositions(
                        observerPositions.filter((x) => x !== p),
                      )
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

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Combobox
                items={positionOptions}
                multiple
                value={observeePositions}
                onValueChange={(v: string[]) => setObserveePositions(v)}
                filter={(item: string, query: string) => {
                  const label = LA_POSITION_MAP.get(item) ?? item;
                  return (
                    item.toLowerCase().includes(query.toLowerCase()) ||
                    label.toLowerCase().includes(query.toLowerCase())
                  );
                }}
              >
                <ComboboxInput
                  placeholder="Filter observee roles…"
                  className="w-[22rem]"
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
              {observeePositions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setObserveePositions([])}
                >
                  Clear
                </Button>
              )}
            </div>
            {observeePositions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {observeePositions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setObserveePositions(
                        observeePositions.filter((x) => x !== p),
                      )
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th
                    className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                    onClick={() => toggleSort("observer")}
                  >
                    Observer{sortArrow("observer")}
                  </th>
                  <th className="pb-2 pr-2 font-medium">Role</th>
                  <th
                    className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                    onClick={() => toggleSort("observee")}
                  >
                    Observee{sortArrow("observee")}
                  </th>
                  <th className="pb-2 pr-2 font-medium">Role</th>
                  <th
                    className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                    onClick={() => toggleSort("course")}
                  >
                    Course / Section{sortArrow("course")}
                  </th>
                  <th
                    className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                    onClick={() => toggleSort("when")}
                  >
                    When{sortArrow("when")}
                  </th>
                  <th className="pb-2 pr-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-1.5 pr-2">
                      <div className="font-medium">{r.observer_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.observer_email}
                      </div>
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {positionLabel(r.observer_position)}
                    </td>
                    <td className="py-1.5 pr-2">
                      <div className="font-medium">{r.observee_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.observee_email}
                      </div>
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {positionLabel(r.observee_position)}
                    </td>
                    <td className="py-1.5 pr-2 whitespace-nowrap text-muted-foreground">
                      {r.course_name} {r.section_name}
                    </td>
                    <td className="py-1.5 pr-2 whitespace-nowrap text-muted-foreground">
                      Wk {r.week} · {r.day} {formatTimeRange(r.time)}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setToDelete(r)}
                        aria-label="Delete sign-up"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="counts" className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Observation sign-ups per LA, counted once per pairing.
          </p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name or email…"
              value={countQuery}
              onChange={(e) => setCountQuery(e.target.value)}
              className="max-w-md"
            />
            {countQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCountQuery("")}
              >
                Clear
              </Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {counts.length} of {countMap.size}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Combobox
                items={positionOptions}
                multiple
                value={countPositions}
                onValueChange={(v: string[]) => setCountPositions(v)}
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
                  className="w-[22rem]"
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
              {countPositions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCountPositions([])}
                >
                  Clear
                </Button>
              )}
            </div>
            {countPositions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {countPositions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setCountPositions(countPositions.filter((x) => x !== p))
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th
                    className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                    onClick={() => toggleCountSort("name")}
                  >
                    LA{countArrow("name")}
                  </th>
                  <th
                    className="cursor-pointer pb-2 pr-2 font-medium select-none hover:text-foreground"
                    onClick={() => toggleCountSort("email")}
                  >
                    Email{countArrow("email")}
                  </th>
                  <th className="pb-2 pr-2 font-medium">Roles</th>
                  <th
                    className="cursor-pointer pb-2 pr-2 text-center font-medium select-none hover:text-foreground"
                    onClick={() => toggleCountSort("as_observer")}
                  >
                    Sign-ups{countArrow("as_observer")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {counts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-1.5 pr-2 font-medium">{c.name}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {c.email}
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {positionLabel(c.position)}
                    </td>
                    <td className="py-1.5 pr-2 text-center">{c.as_observer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

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
                  {toDelete.week}, {toDelete.day} {formatTimeRange(toDelete.time)})? The
                  availability slot will be reopened.
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
