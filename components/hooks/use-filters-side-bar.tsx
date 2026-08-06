// lib/hooks/use-filter-sidebar.ts
"use client";
import { useState, useCallback } from "react";

function countActiveFilters(filter: Record<string, unknown>): number {
  return Object.values(filter).filter(
    (v) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0),
  ).length;
}

export function useFilterSidebar<T extends Record<string, unknown>>(
  onApply: (filter: T | undefined) => void,
) {
  const [open, setOpen] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  const handleApply = useCallback(
    (filter: T) => {
      const count = countActiveFilters(filter);
      setActiveCount(count);
      onApply(count > 0 ? filter : undefined);
      setOpen(false);
    },
    [onApply],
  );

  return {
    open,
    activeCount,
    openSidebar: () => setOpen(true),
    closeSidebar: () => setOpen(false),
    handleApply,
  };
}