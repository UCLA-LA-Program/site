import { FeedbackUidRow } from "@/app/api/admin/audit/feedback-uids/route";
import { fetcher } from "@/lib/utils";
import { useToggleSet } from "@/hooks/use-toggle-set";
import { Check, Copy, ChevronRight, Download } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import * as XLSX from "xlsx";

type UidInformation = {
  uid: string | null;
  name: string | null;
  email: string | null;
  mq_course_change?: string | null;
};

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

function downloadExcel(
  course: string,
  uids: UidInformation[],
  type: "mid_quarter" | "end_of_quarter",
) {
  const wb = XLSX.utils.book_new();
  const uidRows = uids.map((u) => ({
    uid: u.uid,
    name: u.name,
    email: u.email,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(uidRows), "UIDs");

  if (type === "mid_quarter") {
    const feedbackRows = uids
      .filter((u) => u.mq_course_change && u.mq_course_change.trim() !== "")
      .map((u) => ({
        "What would you change about this course?": u.mq_course_change,
      }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(feedbackRows),
      "Course Change",
    );
  }

  XLSX.writeFile(wb, `${course} UIDs - ${type}.xlsx`);
}

function UidLists() {
  const { data: rows } = useSWR<FeedbackUidRow[]>(
    "/api/admin/audit/feedback-uids",
    fetcher,
  );
  const [expanded, toggle] = useToggleSet<string>();

  if (!rows) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const byCourse = new Map<
    string,
    {
      mid_quarter: UidInformation[];
      end_of_quarter: UidInformation[];
    }
  >();
  for (const row of rows) {
    const course = row.course ?? "(no course)";
    let entry = byCourse.get(course);
    if (!entry) {
      entry = { mid_quarter: [], end_of_quarter: [] };
      byCourse.set(course, entry);
    }
    entry[row.feedback_type].push({
      uid: row.uid,
      name: row.name,
      email: row.email,
      ...(row.feedback_type === "mid_quarter" && {
        mq_course_change: row.mq_course_change,
      }),
    });
  }

  const courses = [...byCourse].sort();

  if (courses.length === 0) {
    return <p className="text-sm text-muted-foreground">No feedback yet.</p>;
  }

  return (
    <div className="space-y-4">
      {courses.map(([course, entry]) => {
        const isExpanded = expanded.has(course);
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
                  {entry.mid_quarter.length} mid · {entry.end_of_quarter.length}{" "}
                  end
                </span>
              </button>
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
                        <button
                          type="button"
                          onClick={() =>
                            downloadExcel(course, entry[type], type)
                          }
                          className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
                          title="Download Excel"
                        >
                          <Download className="size-3" />
                          Download Excel
                        </button>
                      </div>
                    </div>
                    <pre className="max-h-64 overflow-auto rounded-md border bg-muted/30 p-2 font-mono text-xs">
                      {entry[type].length > 0
                        ? entry[type]
                            .map((u) => `${u.uid}\t${u.name}\t${u.email}`)
                            .join("\n")
                        : "—"}
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

export function ReportTab() {
  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Mid &amp; End-of-Quarter Feedback UIDs
        </h2>
        <p className="text-xs text-muted-foreground">
          Mid-quarter Excel exports include a second sheet with each
          student&apos;s &ldquo;What would you change about this course?&rdquo;
          response.
        </p>
        <UidLists />
      </div>
    </div>
  );
}
