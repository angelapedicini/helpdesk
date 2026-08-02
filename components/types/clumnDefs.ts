// types/clumnDefs.ts
import { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string; // supporta anche dot-notation, es. "category.name"
  label: string;
  render?: (value: any, row: T) => ReactNode; // ora opzionale
  align?: "left" | "center" | "right";
  minWidth?: number;
};

// helper per leggere valori annidati tipo "category.name"
export function getValueByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}