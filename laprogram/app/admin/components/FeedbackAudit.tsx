"use client";

import { useState } from "react";
import useSWR from "swr";
import { Check, ChevronRight, Copy } from "lucide-react";
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

function CopyButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
      title="Copy"
    >
      {copied ? (
        <>
          <Check className="size-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  );
}

function UidLists() {
  const { data: rows } = useSWR<FeedbackUidRow[]>(
    "/api/admin/audit/feedback-uids",
    fetcher,
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  function toggle(course: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(course)) next.delete(course);
      else next.add(course);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {courses.map(([course, entry]) => {
        const isExpanded = expanded.has(course);
        const courseAll = [...entry.mid_quarter, ...entry.end_of_quarter];
        return (
          <div key={course} className="space-y-2">
            <div className="flex w-full items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggle(course)}
                className="flex items-center gap-1.5 text-left text-sm font-semibold hover:text-muted-foreground"
              >
                <ChevronRight
                  className={`size-4 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
                {course}
                <span className="text-xs font-normal text-muted-foreground">
                  {entry.mid_quarter.length} mid ·{" "}
                  {entry.end_of_quarter.length} end
                </span>
              </button>
              <CopyButton
                text={courseAll.join("\n")}
                disabled={courseAll.length === 0}
              />
            </div>
            {isExpanded && (
              <div className="grid grid-cols-2 gap-4 pl-5">
                {(["mid_quarter", "end_of_quarter"] as const).map((type) => (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {type === "mid_quarter"
                          ? "Mid-Quarter"
                          : "End-of-Quarter"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {entry[type].length}
                        </span>
                        <CopyButton
                          text={entry[type].join("\n")}
                          disabled={entry[type].length === 0}
                        />
                      </div>
                    </div>
                    <pre className="max-h-64 overflow-auto rounded-md border bg-muted/30 p-2 font-mono text-xs">
                      {entry[type].length > 0 ? entry[type].join("\n") : "—"}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
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
