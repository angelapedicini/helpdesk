// hooks/use-reset-registry.ts
import { useRef, useCallback } from "react";

export function useResetRegistry() {
  const registryRef = useRef<Map<string, () => void>>(new Map());

  const registerReset = useCallback((name: string, fn: () => void) => {
    registryRef.current.set(name, fn);
    return () => {
      registryRef.current.delete(name);
    };
  }, []);

  const resetAll = useCallback(() => {
    registryRef.current.forEach((fn) => fn());
  }, []);

  return { registerReset, resetAll };
}