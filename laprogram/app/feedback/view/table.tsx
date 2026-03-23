"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Column } from "./columns";
import type { AnonFeedback } from "./columns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FeedbackTableProps {
  columns: Column[];
  data: AnonFeedback[];
}

export function FeedbackTable({ columns, data }: FeedbackTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  function toggleRow(idx: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="overflow-auto rounded-md border">
      <Table className="table-fixed text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 border-b-0" />
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "w-40 px-2 py-2 whitespace-normal align-text-top border-l",
                  col.width,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row, idx) => {
              const expanded = expandedRows.has(idx);
              return (
                <TableRow
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => toggleRow(idx)}
                >
                  <TableCell className="w-8 px-2">
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  {columns.map((col) => {
                    const val = (row as Record<string, unknown>)[col.key];
                    return (
                      <TableCell
                        key={col.key}
                        className="px-2 whitespace-normal align-top border-l"
                      >
                        <div className={expanded ? "" : "line-clamp-3"}>
                          {col.render
                            ? col.render(val)
                            : (val as React.ReactNode)}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="h-16 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
