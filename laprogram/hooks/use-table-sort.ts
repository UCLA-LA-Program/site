"use client";

import { useState } from "react";

export type SortDir = "asc" | "desc";

export function useTableSort<K extends string>(
  initialKey: K,
  descByDefault: readonly K[] = [],
) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(
    descByDefault.includes(initialKey) ? "desc" : "asc",
  );

  function toggle(key: K) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(descByDefault.includes(key) ? "desc" : "asc");
    }
  }

  function arrow(key: K) {
    return sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  }

  return { sortKey, sortDir, toggle, arrow };
}
