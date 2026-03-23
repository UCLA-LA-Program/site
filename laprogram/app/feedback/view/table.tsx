"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Column } from "./columns";
import type { AnonFeedback } from "../schema";

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
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="w-40 text-xs py-2 whitespace-normal align-text-top"
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
                  <TableCell className="w-10 px-2">
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
                        className="whitespace-normal align-top"
                      >
                        <div className={expanded ? "" : "line-clamp-3"}>
                          {col.render ? col.render(val) : (val as React.ReactNode)}
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
                className="h-24 text-center"
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
