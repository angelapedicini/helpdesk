import { useState, useCallback } from "react";

export function useModalState<T>() {
  // null = chiuso, undefined = aperto senza valore, T = aperto con valore
  const [value, setValue] = useState<T | null | undefined>(null);

  const open = useCallback((v: T) => setValue(v), []);
  const openEmpty = useCallback(() => setValue(undefined), []);
  const close = useCallback(() => setValue(null), []);
  const onModalClose = useCallback(() => setValue(null), []);

  return {
    value: value ?? null,
    isOpen: value !== null,
    open,
    openEmpty,
    close,
    onModalClose,
  };
}