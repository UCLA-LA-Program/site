"use client";

import { useState } from "react";

export function useToggleSet<T>(initial: Iterable<T> = []) {
  const [set, setSet] = useState<Set<T>>(new Set(initial));

  function toggle(value: T) {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return [set, toggle, setSet] as const;
}
