"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { FeedbackView } from "@/app/feedback/view/FeedbackView";
import type { RosterUser } from "@/app/api/admin/roster/route";
import type { FeedbackUidRow } from "@/app/api/admin/audit/feedback-uids/route";

function UidLists() {
  const { data: rows } = useSWR<FeedbackUidRow[]>(
    "/api/admin/audit/feedback-uids",
    fetcher,
  );

  if (!rows) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const byCourse = new Map<
    string,
    { mid_quarter: string[]; end_of_quarter: string[] }
  >();
  for (const row of rows) {
    if (!row.uid) continue;
    const course = row.course ?? "(no course)";
    let entry = byCourse.get(course);
    if (!entry) {
      entry = { mid_quarter: [], end_of_quarter: [] };
      byCourse.set(course, entry);
    }
    entry[row.feedback_type].push(row.uid);
  }

  const courses = [...byCourse].sort(([a], [b]) => a.localeCompare(b));

  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No mid/end feedback yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map(([course, entry]) => (
        <div key={course} className="space-y-2">
          <h3 className="text-sm font-semibold">{course}</h3>
          <div className="grid grid-cols-2 gap-4">
            {(["mid_quarter", "end_of_quarter"] as const).map((type) => (
              <div key={type}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {type === "mid_quarter" ? "Mid-Quarter" : "End-of-Quarter"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry[type].length}
                  </span>
                </div>
                <pre className="max-h-64 overflow-auto rounded-md border bg-muted/30 p-2 font-mono text-xs">
                  {entry[type].length > 0 ? entry[type].join("\n") : "—"}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeedbackAudit() {
  const { data: roster } = useSWR<RosterUser[]>("/api/admin/roster", fetcher);
  const [selectedId, setSelectedId] = useState<string>("");

  const userById = new Map((roster ?? []).map((u) => [u.id, u]));
  const ids = (roster ?? []).map((u) => u.id);

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Combobox
            items={ids}
            value={selectedId}
            onValueChange={(v: string | null) => setSelectedId(v ?? "")}
            filter={(item: string, query: string) => {
              const u = userById.get(item);
              if (!u) return false;
              const q = query.toLowerCase();
              return (
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
              );
            }}
          >
            <ComboboxInput placeholder="Pick a user…" className="w-96" />
            <ComboboxContent>
              <ComboboxEmpty>No users</ComboboxEmpty>
              <ComboboxList>
                <ComboboxCollection>
                  {(item: string) => {
                    const u = userById.get(item);
                    return (
                      <ComboboxItem key={item} value={item}>
                        {u?.name}{" "}
                        <span className="text-muted-foreground">
                          {u?.email}
                        </span>
                      </ComboboxItem>
                    );
                  }}
                </ComboboxCollection>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {selectedId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedId("")}
            >
              Clear
            </Button>
          )}
        </div>
        {selectedId ? (
          <FeedbackView key={selectedId} userId={selectedId} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a user to view their feedback.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Mid &amp; End-of-Quarter Feedback UIDs
        </h2>
        <UidLists />
      </div>
    </div>
  );
}
