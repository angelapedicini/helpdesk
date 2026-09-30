// components/hooks/use-filter-state.ts
"use client";

import { useState, useCallback } from "react";

/**
 * `initial` serve alla pagina ticket, che avvia il filtro da ?filter=...
 * (il link delle card contatore della dashboard). Senza, quel parametro
 * arriverebbe in pagina e verrebbe ignorato.
 */
export function useFilterState<TFilter extends Record<string, unknown>>(
  initial?: TFilter
) {
  const [filter, setFilter] = useState<TFilter | undefined>(initial);
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = filter
    ? Object.values(filter).filter((v) => v !== undefined).length
    : 0;

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const apply = useCallback((newFilter: TFilter) => {
    const activeValues = Object.values(newFilter).filter(
      (v) => v !== undefined
    );

    setFilter(activeValues.length > 0 ? newFilter : undefined);
    setIsOpen(false);
  }, []);

  const reset = useCallback(() => {
    setFilter(undefined);
    setIsOpen(false);
  }, []);

  return {
    filter,
    activeCount,
    isOpen,
    open,
    close,
    apply,
    reset,
  };
}